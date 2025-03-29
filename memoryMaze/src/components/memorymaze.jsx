import { useEffect, useState } from "react";

const MemoryGame = () => {
    const [gridSize, setGridSize] = useState(2);
    const [cards, setCards] = useState([]);

    const [flipped, setFlipped] = useState([]);
    const [solved, setSolved] = useState([]);
    const [disabled, setDisabled] = useState(false);

    const [won, setWon] = useState(false);

    const handleGridSizeChange = (e) => {
        const size = parseInt(e.target.value);
        if (size >= 2 && size <= 10) {
            setGridSize(size);
        }
    };

    const initializeGame = () => {
        const totalCards = gridSize * gridSize;
        const pairCount = Math.floor(totalCards / 2);
        const numbers = [...Array(pairCount).keys()].map((n) => n + 1);
        const shuffledCards = [...numbers, ...numbers]
            .sort(() => Math.random() - 0.5)
            .slice(0, totalCards)
            .map((number, index) => ({ id: index, number }));

        setCards(shuffledCards);
        setFlipped([]);
        setSolved([]);
        setWon(false);
    };

    useEffect(() => {
        // Set background image for the whole page
        document.body.style.backgroundImage = "url(https://static.vecteezy.com/system/resources/thumbnails/000/544/257/small_2x/180213_08_Seamless_abstract_Numerical_number__black_and_white_01.jpg)";
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundAttachment = "fixed";  // Optional: this makes the background fixed while scrolling
        initializeGame();
    }, [gridSize]);

    const checkMatch = (secondId) => {
        const [firstId] = flipped;
        if (cards[firstId].number === cards[secondId].number) {
            setSolved([...solved, firstId, secondId]);
            setFlipped([]);
            setDisabled(false);
        } else {
            setTimeout(() => {
                setFlipped([]);
                setDisabled(false);
            }, 1000);
        }
    };

    const handleClick = (id) => {
        if (disabled || won) {
            return;
        }

        if (flipped.length === 0) {
            setFlipped([id]);
            return;
        }

        if (flipped.length === 1) {
            setDisabled(true);
            if (id !== flipped[0]) {
                setFlipped([...flipped, id]);
                checkMatch(id);
            } else {
                setFlipped([]);
                setDisabled(false);
            }
        }
    };

    const isFlipped = (id) => flipped.includes(id) || solved.includes(id);
    const isSolved = (id) => solved.includes(id);

    useEffect(() => {
        if (solved.length === cards.length && cards.length > 0) {
            setWon(true);
        }
    }, [solved, cards]);

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
            <div style={{ backgroundColor: "grey", padding: "30px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: "20px" }}>
                <h1 style={{ fontWeight: "bold", marginBottom: "5px", fontSize: "1.875rem", fontFamily: "Comic Sans MS", color: "white" }}>Memory Maze</h1>
                {/* input */}
                <div style={{ marginBottom: "1rem", textAlign: "center" }}>
                    <label htmlFor="gridSize" style={{ marginRight: "0.5rem", fontFamily: "Comic Sans MS", color: "white" }}>Choose Grid Size: (MAX - 10)</label>
                    <br></br>
                    <input
                        type="number"
                        id="gridSize"
                        min="2"
                        max="10"
                        value={gridSize}
                        onChange={handleGridSizeChange}
                        style={{ borderRadius: "10px", padding: "0.25rem 0.5rem", border: "2px solid #d1d5db", }} />
                    <br></br>
                </div>
                {/* game grid */}
                <div style={{ display: "grid", gap: "0.5rem", marginBottom: "1rem", gridTemplateColumns: `repeat(${gridSize}, minmax(0,1fr))`, width: `min(100%, ${gridSize * 5.5}rem)` }}>
                    {cards.map((card) => {
                        return (
                            <div
                                key={card.id}
                                onClick={() => handleClick(card.id)}
                                style={{
                                    aspectRatio: "1/1", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "1.25rem", fontWeight: "bold", borderRadius: "0.5rem", cursor: "pointer", transition: "all 0.3s ease-in-out", backgroundColor: isFlipped(card.id) ? isSolved(card.id) ? "#22c55e" : "#3b82f6" : "#d1d5db", color: isFlipped(card.id) ? "#ffffff" : "#9ca3af",
                                }}>
                                {isFlipped(card.id) ? card.number : " 🤔 "}
                            </div>
                        )
                    })}
                </div>
                {/* result */}
                {won && (
                    <div style={{ marginTop: "1rem", fontSize: "2.25rem", fontWeight: "bold", color: "white", animation: "bounce 1s infinite" }}>
                        You Won!
                    </div>
                )}
                {/* reset / play again button */}
                <button
                    onClick={initializeGame}
                    style={{
                        marginTop: "1rem",
                        padding: "0.5rem 1rem",
                        backgroundColor: "#22c55e",
                        color: "#ffffff",
                        borderRadius: "0.25rem",
                        transition: "background-color 0.3s ease-in-out",
                    }}
                >
                    {won ? "Play Again" : "Reset"}
                </button>
            </div>
        </div>
    )
}
export default MemoryGame;
