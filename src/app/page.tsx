"use client";

import { useState } from "react";

// --- TYPES AND DATA (No changes here) ---
type GameState = "guessing" | "submittingOpinion" | "results";
type Question = { prompt: string; leftLabel: string; rightLabel: string; };
const questions: Question[] = [
  { prompt: "Is a hot dog a sandwich?", leftLabel: "Definitely Not", rightLabel: "Absolutely Yes" },
  { prompt: "How important is work-life balance?", leftLabel: "Not at all", rightLabel: "Extremely" },
  { prompt: "Is Star Wars or Star Trek better?", leftLabel: "Star Trek", rightLabel: "Star Wars" },
];
// --- END TYPES AND DATA ---

export default function Home() {
  // --- STATE MANAGEMENT ---
  const [gameState, setGameState] = useState<GameState>("guessing");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // State for the current round's values
  const [guessValue, setGuessValue] = useState(50);
  const [opinionValue, setOpinionValue] = useState(50);

  // State to hold the final values for the results screen
  const [finalGuess, setFinalGuess] = useState(0);
  const [finalOpinion, setFinalOpinion] = useState(0);
  const [resultsData, setResultsData] = useState({ hivemind: 0, score: 0 });
  // --- END STATE MANAGEMENT ---

  const question = questions[currentQuestionIndex];

  // --- GAME LOGIC FUNCTIONS ---
  const handleGuessSubmit = () => {
    console.log("User guessed:", guessValue);
    setGameState("submittingOpinion");
  };

  const handleOpinionSubmit = async () => {
    console.log("User's opinion:", opinionValue);

    try {
      // Call our new backend API route
      const response = await fetch('/api/get-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: currentQuestionIndex }), // Assuming index is the ID for now
      });

      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }

      const worldResults = await response.json(); // { hivemind_average: 73.5, answer_count: 1500 }
      
      // --- REAL RESULTS LOGIC ---
      const hivemindResult = worldResults.hivemind_average || 50; // Use 50 as a fallback
      const difference = Math.abs(guessValue - hivemindResult);
      const score = Math.round(100 - difference);
      
      // Save the final values for the results screen
      setFinalGuess(guessValue);
      setFinalOpinion(opinionValue);
      setResultsData({ hivemind: hivemindResult, score: score });
      
      // Move to the results screen
      setGameState("results");

    } catch (error) {
      console.error("Error fetching results:", error);
      // Optionally, show an error message to the user
      alert("Sorry, couldn't fetch the world's results. Please try again.");
    }
  };

  const handlePlayAgain = () => {
    // Move to the next question
    setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % questions.length);
    
    // Reset for the next round
    setGameState("guessing");
    setGuessValue(50);
    setOpinionValue(50);
  };
  // --- END GAME LOGIC FUNCTIONS ---


  // --- UI RENDERING ---
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-800 p-8 shadow-lg">
        
        {/* The Results View */}
        {gameState === 'results' ? (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold">Results</h1>
              <p className="text-slate-400 mt-1">{question.prompt}</p>
            </div>
            
            <div className="text-center mb-6">
              <p className="text-lg">Your Score</p>
              <p className="text-7xl font-bold text-cyan-400">{resultsData.score}</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium text-slate-300">
                <span>{question.leftLabel}</span>
                <span>{question.rightLabel}</span>
              </div>
              {/* Visual Spectrum Bar */}
              <div className="relative h-4 w-full rounded-full bg-slate-600">
                  {/* Your Guess Marker */}
                  <div className="absolute top-1/2 -translate-y-1/2 text-2xl" style={{ left: `${finalGuess}%`, transform: 'translateX(-50%)' }}>
                    🔵
                    <span className="absolute -top-6 text-xs font-bold text-blue-400">Guess</span>
                  </div>
                  {/* Your Opinion Marker */}
                  <div className="absolute top-1/2 -translate-y-1/2 text-2xl" style={{ left: `${finalOpinion}%`, transform: 'translateX(-50%)' }}>
                    🟣
                    <span className="absolute top-6 text-xs font-bold text-purple-400">You</span>
                  </div>
                  {/* Hivemind Marker */}
                  <div className="absolute top-1/2 -translate-y-1/2 text-2xl" style={{ left: `${resultsData.hivemind}%`, transform: 'translateX(-50%)' }}>
                    🎯
                    <span className="absolute -top-6 text-xs font-bold text-yellow-400">Hivemind</span>
                  </div>
              </div>
            </div>

            <div className="mt-12">
              <button onClick={handlePlayAgain} className="w-full rounded-lg bg-green-600 px-4 py-3 text-lg font-bold text-white transition hover:bg-green-700">
                Play Next Round
              </button>
            </div>
          </div>
        ) : (
          /* The Guessing/Opinion View (No changes here) */
          <div>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold">Spectrum</h1>
              <p className="text-slate-400">
                {gameState === 'guessing' ? "Guess the Hivemind!" : "What's your take?"}
              </p>
            </div>
            <div className="mb-6"><p className="text-center text-lg">{question.prompt}</p></div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium text-slate-300">
                <span>{question.leftLabel}</span>
                <span>{question.rightLabel}</span>
              </div>
              <input type="range" min="0" max="100" value={gameState === 'guessing' ? guessValue : opinionValue} onChange={(e) => gameState === 'guessing' ? setGuessValue(parseInt(e.target.value)) : setOpinionValue(parseInt(e.target.value))} className={`w-full h-2 ${gameState === 'guessing' ? 'bg-slate-600' : 'bg-rose-600'} rounded-lg appearance-none cursor-pointer`} />
            </div>
            <div className="mt-8">
              {gameState === 'guessing' ? (
                <button onClick={handleGuessSubmit} className="w-full rounded-lg bg-blue-600 px-4 py-3 text-lg font-bold text-white transition hover:bg-blue-700">Lock In Guess</button>
              ) : (
                <button onClick={handleOpinionSubmit} className="w-full rounded-lg bg-rose-600 px-4 py-3 text-lg font-bold text-white transition hover:bg-rose-700">Submit Opinion</button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}