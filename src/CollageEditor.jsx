import React, { useRef, useState } from "react";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function CollageEditor() {
  //for git paths
  const base = import.meta.env.BASE_URL;

  //for canvas
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  //for redo/undo
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  //for tool state
  const [currentTool, setCurrentTool] = useState(null);
  const [selectedElementId, setSelectedElementId] = useState(null);

  //for dragging
  const [position, setPosition] = useState({ x: 50, y: 50 });

  //for drawing
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState([]);
  const [penColor, setPenColor] = useState("#000000");
  const [penWidth, setPenWidth] = useState(2);
  const [showPenSettings, setShowPenSettings] = useState(false);

  //for images
  const [imageElements, setImageElements] = useState([]);

  //for tapes
  const [tapes, setTapes] = useState([]);
  const [tapeStart, setTapeStart] = useState(null);
  const [tapeFill, setTapeFill] = useState("solid"); // "solid" or "pattern"
  const [tapeColor, setTapeColor] = useState("#C0C0C0");
  const [tapePattern, setTapePattern] = useState("washi-1"); // pattern name
  const patternImages = {
    "washi-1": `${base}patterns/washi-1.png`,
    "washi-2": `${base}patterns/washi-2.png`,
    "washi-3": `${base}patterns/washi-3.png`,
    "washi-4": `${base}patterns/washi-4.png`,
    "washi-5": `${base}patterns/washi-5.png`,
    "washi-6": `${base}patterns/washi-6.png`,
    "washi-7": `${base}patterns/washi-7.png`,
    "washi-8": `${base}patterns/washi-8.png`,
    "washi-9": `${base}patterns/washi-9.png`,
    "washi-10": `${base}patterns/washi-10.png`,
    "washi-11": `${base}patterns/washi-11.png`,
    "washi-12": `${base}patterns/washi-12.png`,
    "washi-13": `${base}patterns/washi-13.png`,
    "washi-14": `${base}patterns/washi-14.png`,
    "washi-15": `${base}patterns/washi-15.png`,
    "washi-16": `${base}patterns/washi-16.png`,
    "washi-17": `${base}patterns/washi-17.png`,
    "washi-18": `${base}patterns/washi-18.png`,
    "washi-19": `${base}patterns/washi-19.png`,
    "washi-20": `${base}patterns/washi-20.png`,
    "washi-21": `${base}patterns/washi-21.png`,
    "washi-22": `${base}patterns/washi-22.png`,
    "washi-23": `${base}patterns/washi-23.png`,
    "washi-24": `${base}patterns/washi-24.png`,
    "washi-25": `${base}patterns/washi-25.png`,
    "washi-26": `${base}patterns/washi-26.png`,
    "washi-27": `${base}patterns/washi-27.png`,
    "washi-28": `${base}patterns/washi-28.png`,
    "washi-29": `${base}patterns/washi-29.png`,
    "washi-30": `${base}patterns/washi-30.png`,
  };
  const [loadedPatterns, setLoadedPatterns] = useState({});
  useEffect(() => {
    const entries = Object.entries(patternImages).map(([key, src]) => {
      const img = new Image();
      img.src = src;
      return [key, img];
    });
    setLoadedPatterns(Object.fromEntries(entries));
  }, []);

  //for stickers
  const [stickers, setStickers] = useState([]);
  const stickerImages = [
    "astronaut",
    "bear",
    "black-cat",
    "brown-olive-branch",
    "bubbles",
    "butterfly-earring",
    "cat-selfie",
    "cd",
    "dice",
    "earbuds",
    "fish",
    "funny-cat",
    "letters",
    "moon",
    "motorola",
    "mspaint",
    "pink-flowers",
    "playing",
    "polaroids",
    "rainbowfairyprincess",
    "strawberry-cake",
    "strawberry",
    "suitcase",
    "tamagotchi",
    "tape",
    "torn-paper",
    "waffles",
    "windows95",
  ];

  //for text
  const [texts, setTexts] = useState([]);
  const [textSettings, setTextSettings] = useState({
    font: "Roboto",
    size: 24,
    color: "#000000",
    stroke: false,
    strokeColor: "#ffffff",
    thickness: 1,
    locked: false,
  });

  //button component
  const Button = ({ children, ...props }) => (
    <button
      {...props}
      className="p-1 px-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
    >
      {children}
    </button>
  );

  //for bubble integration
  const getCurrentCanvasState = useCallback(
    () => ({
      strokes,
      tapes,
      imageElements,
      stickers,
      texts,
    }),
    [strokes, tapes, imageElements, stickers, texts]
  );

  function loadFromJson(data) {
    console.log("🧩 Loading project:", data);

    if (!data || typeof data !== "object") {
      console.warn("⚠️ loadFromJson called with invalid data:", data);
      return;
    }

    const isEmpty =
      (!data.strokes || data.strokes.length === 0) &&
      (!data.tapes || data.tapes.length === 0) &&
      (!data.imageElements || data.imageElements.length === 0) &&
      (!data.stickers || data.stickers.length === 0) &&
      (!data.texts || data.texts.length === 0);

    if (isEmpty) {
      console.warn("⚠️ Skipping loadFromJson — all fields are empty.");
      return;
    }

    // First, clear everything to force state update
    setStrokes([]);
    setTapes([]);
    setImageElements([]);
    setStickers([]);
    setTextElements([]);

    // Then apply loaded data on next frame
    setTimeout(() => {
      if (data) {
        setStrokes(data.strokes || []);
        setTapes(data.tapes || []);
        setImageElements(data.imageElements || []);
        setStickers(data.stickers || []);
        setTextElements(data.texts || []);
        setCanvasSize((s) => ({ ...s })); // force re-render of canvas
      }
    }, 0);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const data = {
        strokes,
        tapes,
        imageElements,
        stickers,
        texts,
      };
      console.log("📡 Posting SAVE_PROJECT", data);
      window.parent.postMessage({ type: "SAVE_PROJECT", payload: data }, "*");
    }, 5000);

    return () => clearInterval(interval);
  }, [strokes, tapes, imageElements, stickers, texts]); // ✅ keep these

  const clampToBounds = (x, y, width, height, canvasWidth, canvasHeight) => {
    const clampedX = Math.max(0, Math.min(x, canvasWidth - width));
    const clampedY = Math.max(0, Math.min(y, canvasHeight - height));
    return { x: clampedX, y: clampedY };
  };

  const recordHistory = () => {
    setHistory((prev) => [
      ...prev,
      {
        strokes,
        tapes,
        imageElements,
        stickers,
        texts,
      },
    ]);
    setFuture([]); // clear redo stack
  };

  const handleUndo = () => {
    if (history.length === 0) return;

    const previousState = history[history.length - 1];
    setFuture((f) => [
      ...f,
      {
        strokes,
        tapes,
        imageElements,
        stickers,
        texts,
      },
    ]);
    setHistory((h) => h.slice(0, -1));

    setStrokes(previousState.strokes);
    setTapes(previousState.tapes);
    setImageElements(previousState.imageElements);
    setStickers(previousState.stickers);
    setTexts(previousState.texts);
  };

  const handleRedo = () => {
    if (future.length === 0) return;

    const nextState = future[future.length - 1];
    setHistory((h) => [
      ...h,
      {
        strokes,
        tapes,
        imageElements,
        stickers,
        texts,
      },
    ]);
    setFuture((f) => f.slice(0, -1));

    setStrokes(nextState.strokes);
    setTapes(nextState.tapes);
    setImageElements(nextState.imageElements);
    setStickers(nextState.stickers);
    setTexts(nextState.texts);
  };

  const startDrawing = (e) => {
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    if (currentTool === "tape") {
      recordHistory();
      setTapeStart({ x, y });
      return; // don't continue with other tools
    }

    if (currentTool === "eraser") {
      recordHistory();
      const radius = 10;

      // Erase strokes near point
      setStrokes((prev) =>
        prev.filter(
          (stroke) =>
            !stroke.points.some((pt) => Math.hypot(pt.x - x, pt.y - y) < radius)
        )
      );

      // Erase tapes near the line
      setTapes((prev) =>
        prev.filter((tape) => {
          const { start, end } = tape;

          // Compute distance from point (x, y) to line segment (start, end)
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const lengthSq = dx * dx + dy * dy;

          if (lengthSq === 0) return true; // avoid dividing by zero

          let t = ((x - start.x) * dx + (y - start.y) * dy) / lengthSq;
          t = Math.max(0, Math.min(1, t));

          const projX = start.x + t * dx;
          const projY = start.y + t * dy;

          const dist = Math.hypot(x - projX, y - projY);
          return dist > radius;
        })
      );

      setRedoStack([]); // Clear redo history on new action
      return;
    }

    if (currentTool !== "pencil") return;

    recordHistory();
    setShowPenSettings(false); // hide panel when drawing begins

    setStrokes((prev) => [
      ...prev,
      {
        points: [{ x, y }],
        color: penColor,
        width: penWidth,
      },
    ]);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || currentTool !== "pencil") return;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    setStrokes((prev) => {
      const lastStroke = prev[prev.length - 1];
      const updatedStroke = {
        ...lastStroke,
        points: [...lastStroke.points, { x, y }],
      };
      return [...prev.slice(0, -1), updatedStroke];
    });
  };

  const stopDrawing = (e) => {
    if (currentTool === "tape" && tapeStart) {
      const endX = e.nativeEvent.offsetX;
      const endY = e.nativeEvent.offsetY;

      const newTape = {
        start: tapeStart,
        end: { x: endX, y: endY },
        color: tapeColor,
        fill: tapeFill,
        pattern: tapePattern,
      };

      setTapes((prev) => [...prev, newTape]);
      setTapeStart(null);
      return;
    }

    setIsDrawing(false);
  };

  const drawGrid = (ctx, width, height, spacing = 40) => {
    ctx.strokeStyle = "#e5e5e5";
    ctx.lineWidth = 1;

    for (let x = 0; x < width; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const deleteText = (id) => {
    recordHistory();
    setTexts((prev) => prev.filter((text) => text.id !== id));
  };

  const deleteElement = (id) => {
    recordHistory();
    setImageElements((prev) => prev.filter((img) => img.id !== id));
  };

  const toggleTextLock = (id) => {
    recordHistory();
    setTexts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, locked: !t.locked } : t))
    );
  };

  const toggleLock = (id) => {
    recordHistory();
    setImageElements((prev) =>
      prev.map((img) => (img.id === id ? { ...img, locked: !img.locked } : img))
    );
  };

  const handleImageUpload = (e) => {
    recordHistory();
    const file = e.target.files[0];

    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      recordHistory();
      const newImage = {
        id: Date.now(),
        src: reader.result,
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        locked: false,
      };
      setImageElements((prev) => [...prev, newImage]);
    };
    reader.readAsDataURL(file);
  };

  const resizeCanvas = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    setCanvasSize({ width, height }); // trigger re-render
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      if (ctrlOrCmd && e.key === "z") {
        e.preventDefault();
        handleUndo();
      } else if (
        ctrlOrCmd &&
        (e.key === "y" || (e.shiftKey && e.key === "Z"))
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  useEffect(() => {
    const entries = Object.entries(patternImages).map(([key, src]) => {
      const img = new Image();
      img.src = src;
      return [key, img];
    });
    setLoadedPatterns(Object.fromEntries(entries));
  }, []);

  useEffect(() => {
    resizeCanvas(); // do it on first mount
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid(ctx, canvas.width, canvas.height);

    strokes.forEach((stroke) => {
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.beginPath();
      stroke.points.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
    });

    tapes.forEach((tape) => {
      const { start, end, color, fill, pattern } = tape;
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const length = Math.hypot(end.x - start.x, end.y - start.y);

      ctx.save();
      ctx.translate(start.x, start.y);
      ctx.rotate(angle);

      if (fill === "pattern" && pattern && loadedPatterns[pattern]) {
        const img = loadedPatterns[pattern];
        if (img.complete) {
          const patternCanvas = document.createElement("canvas");
          const pctx = patternCanvas.getContext("2d");
          patternCanvas.width = img.width;
          patternCanvas.height = img.height;
          pctx.drawImage(img, 0, 0);

          const patternFill = ctx.createPattern(patternCanvas, "repeat");
          if (patternFill) {
            ctx.save();
            ctx.scale(1, 50 / img.height); // scale vertically to fit 50px tape height
            ctx.fillStyle = patternFill;
            ctx.fillRect(0, 0, length, img.height);
            ctx.restore();
          }
        } else {
          img.onload = () => {
            setCanvasSize((s) => ({ ...s })); // trigger a redraw once image loads
          };
        }
      } else {
        ctx.fillStyle = color;
        ctx.fillRect(0, -25, length, 50);
      }

      ctx.restore();
    });
  }, [strokes, tapes, canvasSize]); //  triggers redraw on resize

  return (
    <div className="w-screen h-screen flex overflow-hidden">
      {/*─────────── Sidebar (fixed, unaffected by zoom) ─────────── */}
      <div className="w-16 h-full bg-green-200 flex flex-col justify-between py-6">
        <div className="flex flex-col items-center gap-6">
          <button onClick={handleUndo} title="Undo">
            <img
              src={`${import.meta.env.BASE_URL}icons/undo.png`}
              width={35}
              height={35}
            />
          </button>
          <button onClick={handleRedo} title="Redo">
            <img
              src={`${import.meta.env.BASE_URL}icons/redo.png`}
              width={35}
              height={35}
            />
          </button>
          <button
            onClick={() => {
              if (currentTool === "pencil") {
                setShowPenSettings((prev) => !prev);
              } else {
                setCurrentTool("pencil");
                setShowPenSettings(true);
              }
            }}
            className={currentTool === "pencil" ? "bg-yellow-300" : ""}
          >
            <img
              src={`${import.meta.env.BASE_URL}icons/pen.png`}
              width={35}
              height={35}
            />
          </button>
          <button
            onClick={() => {
              setCurrentTool("eraser");
              setShowPenSettings(false);
            }}
            className={currentTool === "eraser" ? "bg-yellow-300" : ""}
          >
            <img
              src={`${import.meta.env.BASE_URL}icons/eraser.png`}
              width={35}
              height={35}
            />
          </button>
          <button
            onClick={() => setCurrentTool("tape")}
            className={currentTool === "tape" ? "bg-yellow-300" : ""}
          >
            <img
              src={`${import.meta.env.BASE_URL}icons/tape.png`}
              width={35}
              height={35}
            />
          </button>
          <button onClick={() => setCurrentTool("sticker")}>
            <img
              src={`${import.meta.env.BASE_URL}icons/sticker.png`}
              width={35}
              height={35}
            />
          </button>
          <button onClick={() => setCurrentTool("text")}>
            <img
              src={`${import.meta.env.BASE_URL}icons/text.png`}
              width={35}
              height={35}
            />
          </button>

          {/* Image upload trigger */}
          <label>
            <span role="button">
              <img
                src={`${import.meta.env.BASE_URL}icons/image.png`}
                width={35}
                height={35}
              />
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          <button>
            <img
              src={`${import.meta.env.BASE_URL}icons/add_collaborator.png`}
              width={35}
              height={35}
            />
          </button>
          <button>
            <img
              src={`${import.meta.env.BASE_URL}icons/save_draft.png`}
              width={35}
              height={35}
            />
          </button>
        </div>
        <div className="flex justify-center">
          <button>
            <img
              src={`${import.meta.env.BASE_URL}icons/post.png`}
              width={35}
              height={35}
            />
          </button>
        </div>
      </div>

      {/* ─────────── Canvas + drawing + elements (zoomed area) ─────────── */}
      <div className="flex-1 relative overflow-hidden">
        {/* Pen settings */}
        {showPenSettings && currentTool === "pencil" && (
          <div className="absolute top-4 left-4 z-50 bg-white p-3 rounded shadow space-y-2">
            <label className="flex items-center gap-2">
              Color:
              <input
                type="color"
                value={penColor}
                onChange={(e) => setPenColor(e.target.value)}
              />
            </label>
            <label className="flex items-center gap-2">
              Thickness:
              <input
                type="range"
                min={1}
                max={10}
                value={penWidth}
                onChange={(e) => setPenWidth(Number(e.target.value))}
                className="w-24"
              />
            </label>
          </div>
        )}

        {currentTool === "tape" && (
          <div className="absolute top-4 left-20 bg-white p-3 rounded shadow space-y-2 z-50">
            <label>
              Color:
              <input
                type="color"
                value={tapeColor}
                onChange={(e) => setTapeColor(e.target.value)}
              />
            </label>
            <label>
              Fill Type:
              <select
                value={tapeFill}
                onChange={(e) => setTapeFill(e.target.value)}
              >
                <option value="solid">Solid</option>
                <option value="pattern">Pattern</option>
              </select>
            </label>

            {tapeFill === "pattern" && (
              <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-scroll w-64 mt-2">
                {Object.entries(patternImages).map(([key, src]) => (
                  <img
                    key={key}
                    src={src}
                    alt={key}
                    className={`w-12 h-12 object-cover cursor-pointer rounded border ${
                      tapePattern === key
                        ? "border-blue-500 ring-2"
                        : "border-gray-300"
                    }`}
                    onClick={() => setTapePattern(key)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {currentTool === "sticker" && (
          <div className="absolute top-4 left-20 bg-white p-3 rounded shadow z-50 max-h-96 overflow-y-scroll w-64 grid grid-cols-4 gap-2">
            {stickerImages.map((name) => (
              <img
                key={name}
                src={`${base}stickers/${name}.png`}
                alt={name}
                className="w-12 h-12 cursor-pointer object-contain"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    "sticker-src",
                    `${base}stickers/${name}.png`
                  );
                  e.dataTransfer.effectAllowed = "copy";
                }}
              />
            ))}
          </div>
        )}

        {currentTool === "text" && (
          <div className="absolute top-4 left-20 bg-white p-3 rounded shadow space-y-2 z-50">
            <label>
              Font:
              <select
                value={textSettings.font}
                onChange={(e) =>
                  setTextSettings((prev) => ({ ...prev, font: e.target.value }))
                }
              >
                <option value="Roboto">Roboto</option>
                <option value="Pacifico">Pacifico</option>
                <option value="Comic Neue">Comic Neue</option>
                <option value="Dancing Script">Dancing Script</option>
                <option value="Courier Prime">Courier Prime</option>
              </select>
            </label>
            <label>
              Size:
              <input
                type="number"
                value={textSettings.size}
                onChange={(e) =>
                  setTextSettings((prev) => ({
                    ...prev,
                    size: Number(e.target.value),
                  }))
                }
                className="w-16"
              />
            </label>
            <label>
              Color:
              <input
                type="color"
                value={textSettings.color}
                onChange={(e) =>
                  setTextSettings((prev) => ({
                    ...prev,
                    color: e.target.value,
                  }))
                }
              />
            </label>
            <label className="flex items-center gap-2">
              Stroke?
              <input
                type="checkbox"
                checked={textSettings.stroke}
                onChange={(e) =>
                  setTextSettings((prev) => ({
                    ...prev,
                    stroke: e.target.checked,
                  }))
                }
              />
            </label>
            {textSettings.stroke && (
              <>
                <label>
                  Stroke Color:
                  <input
                    type="color"
                    value={textSettings.strokeColor}
                    onChange={(e) =>
                      setTextSettings((prev) => ({
                        ...prev,
                        strokeColor: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Thickness:
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={textSettings.thickness}
                    onChange={(e) =>
                      setTextSettings((prev) => ({
                        ...prev,
                        thickness: Number(e.target.value),
                      }))
                    }
                  />
                </label>
              </>
            )}
            <button
              className="bg-green-300 px-2 py-1 rounded mt-2"
              onClick={() => {
                const canvas = canvasRef.current;
                if (!canvas) return;
                recordHistory();

                const rect = canvas.getBoundingClientRect();
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const newText = {
                  id: Date.now(),
                  content: "New Text",
                  x: centerX,
                  y: centerY,
                  font: textSettings.font,
                  size: textSettings.size,
                  color: textSettings.color,
                  stroke: textSettings.stroke,
                  strokeColor: textSettings.strokeColor,
                  thickness: textSettings.thickness,
                };
                setTexts((prev) => [...prev, newText]);
              }}
            >
              Add Text
            </button>
          </div>
        )}

        {/* Zoomable canvas wrapper */}
        <div
          onClick={() => setSelectedElementId(null)}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
          }}
          onDrop={(e) => {
            const src = e.dataTransfer.getData("sticker-src");
            if (src) {
              recordHistory();
              const bounds = canvasRef.current.getBoundingClientRect();
              const x = e.clientX - bounds.left;
              const y = e.clientY - bounds.top;
              const newSticker = {
                id: Date.now(),
                src,
                x,
                y,
                width: 100,
                height: 100,
                locked: false,
              };
              setStickers((prev) => [...prev, newSticker]);
              setCurrentTool(null);
            }
          }}
          style={{ width: "100%", height: "100%", position: "relative" }}
        >
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
          {texts.map((text) => (
            <motion.div
              key={text.id}
              drag={!text.locked}
              dragMomentum={false}
              dragElastic={0}
              dragSnapToOrigin={true}
              dragListener={true}
              style={{
                position: "absolute",
                top: text.y,
                left: text.x,
                x: 0,
                y: 0,
                fontFamily: `'${text.font}', sans-serif`,
                fontSize: `${text.size}px`,
                color: text.color,
                WebkitTextStroke: text.stroke
                  ? `${text.thickness}px ${text.strokeColor}`
                  : "none",
                zIndex: 20,
                cursor: text.locked ? "default" : "move",
              }}
              onClick={(e) => {
                e.stopPropagation(); // prevents background from deselecting it
                setSelectedElementId(text.id);
              }}
              onDragEnd={(event, info) => {
                recordHistory();
                const bounds = canvasRef.current.getBoundingClientRect();
                const deltaX = info.offset.x;
                const deltaY = info.offset.y;
                setTexts((prev) =>
                  prev.map((el) =>
                    el.id === text.id
                      ? {
                          ...el,
                          x: el.x + deltaX,
                          y: el.y + deltaY,
                        }
                      : el
                  )
                );
              }}
            >
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const newText = e.target.textContent;
                  recordHistory();
                  setTexts((prev) =>
                    prev.map((el) =>
                      el.id === text.id ? { ...el, content: newText } : el
                    )
                  );
                }}
              >
                {text.content}
              </div>

              {/* Buttons — not editable */}
              {selectedElementId === text.id && (
                <div
                  className="flex gap-1 mt-1 bg-white p-1 rounded shadow"
                  contentEditable={false}
                >
                  <Button onClick={() => deleteText(text.id)}>🗑️</Button>
                  <Button onClick={() => toggleTextLock(text.id)}>
                    {text.locked ? "🔒" : "🔓"}
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
          {stickers.map((sticker) => (
            <motion.div
              key={sticker.id}
              drag={!sticker.locked}
              dragMomentum={false}
              dragElastic={0}
              dragSnapToOrigin={true}
              dragListener={true}
              style={{
                position: "absolute",
                top: sticker.y,
                left: sticker.x,
                x: 0,
                y: 0,
                cursor: sticker.locked ? "default" : "move",
                zIndex: 15,
              }}
              onClick={(e) => {
                e.stopPropagation(); // prevents background from deselecting it
                setSelectedElementId(sticker.id);
              }}
              onDragEnd={(event, info) => {
                recordHistory();
                const bounds = canvasRef.current.getBoundingClientRect();
                const deltaX = info.offset.x;
                const deltaY = info.offset.y;
                setStickers((prev) =>
                  prev.map((el) =>
                    el.id === sticker.id
                      ? {
                          ...el,
                          x: el.x + deltaX,
                          y: el.y + deltaY,
                        }
                      : el
                  )
                );
              }}
            >
              {/* Sticker */}
              <img
                src={sticker.src}
                alt="sticker"
                style={{
                  width: sticker.width,
                  height: sticker.height,
                  pointerEvents: "none",
                }}
              />

              {/* Resize handle */}
              {!sticker.locked && (
                <div
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    recordHistory();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const { width: sw, height: sh } = sticker;

                    const move = (me) => {
                      const dx = me.clientX - startX;
                      const dy = me.clientY - startY;
                      const nw = Math.max(20, sw + dx);
                      const nh = Math.max(20, sh + dy);
                      setStickers((prev) =>
                        prev.map((el) =>
                          el.id === sticker.id
                            ? { ...el, width: nw, height: nh }
                            : el
                        )
                      );
                    };

                    const up = () => {
                      window.removeEventListener("mousemove", move);
                      window.removeEventListener("mouseup", up);
                    };

                    window.addEventListener("mousemove", move);
                    window.addEventListener("mouseup", up);
                  }}
                  style={{
                    width: 10,
                    height: 10,
                    background: "gray",
                    position: "absolute",
                    right: 0,
                    bottom: 0,
                    cursor: "nwse-resize",
                  }}
                />
              )}

              {/* Lock/Delete controls */}
              {selectedElementId === sticker.id && (
                <div className="flex gap-1 mt-1 bg-white p-1 rounded shadow">
                  <Button
                    onClick={() => {
                      recordHistory();
                      setStickers((prev) =>
                        prev.filter((el) => el.id !== sticker.id)
                      );
                    }}
                  >
                    🗑️
                  </Button>
                  <Button
                    onClick={() => {
                      recordHistory();
                      setStickers((prev) =>
                        prev.map((el) =>
                          el.id === sticker.id
                            ? { ...el, locked: !el.locked }
                            : el
                        )
                      );
                    }}
                  >
                    {sticker.locked ? "🔒" : "🔓"}
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
          {/* Images */}
          {imageElements.map((img) => (
            <motion.div
              key={img.id}
              drag={!img.locked}
              dragMomentum={false}
              dragElastic={0}
              dragSnapToOrigin={true}
              style={{
                position: "absolute",
                top: img.y,
                left: img.x,
                x: 0,
                y: 0,
                cursor: img.locked ? "default" : "move",
                zIndex: 10,
              }}
              onClick={(e) => {
                e.stopPropagation(); // prevents background from deselecting it
                setSelectedElementId(img.id);
              }}
              onDragEnd={(event, info) => {
                recordHistory();
                const bounds = canvasRef.current.getBoundingClientRect();
                const deltaX = info.offset.x;
                const deltaY = info.offset.y;
                setImageElements((prev) =>
                  prev.map((el) =>
                    el.id === img.id
                      ? {
                          ...el,
                          x: el.x + deltaX,
                          y: el.y + deltaY,
                        }
                      : el
                  )
                );
              }}
            >
              <img
                src={img.src}
                style={{
                  width: img.width,
                  height: img.height,
                  pointerEvents: "none",
                }}
                alt="uploaded"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("uploaded-image-src", img.src);
                  e.dataTransfer.effectAllowed = "copy";
                }}
              />

              {/* Resize handle */}
              <div
                onMouseDown={(e) => {
                  e.stopPropagation();
                  recordHistory();
                  const startX = e.clientX;
                  const startY = e.clientY;
                  const { width: sw, height: sh } = img;

                  const move = (me) => {
                    const dx = me.clientX - startX;
                    const dy = me.clientY - startY;
                    const nw = Math.max(20, sw + dx);
                    const nh = Math.max(20, sh + dy);
                    setImageElements((prev) =>
                      prev.map((el) =>
                        el.id === img.id ? { ...el, width: nw, height: nh } : el
                      )
                    );
                  };

                  const up = () => {
                    window.removeEventListener("mousemove", move);
                    window.removeEventListener("mouseup", up);
                  };

                  window.addEventListener("mousemove", move);
                  window.addEventListener("mouseup", up);
                }}
                style={{
                  width: 10,
                  height: 10,
                  background: "gray",
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                  cursor: "nwse-resize",
                }}
              />

              {/* Lock / Delete buttons */}
              {selectedElementId === img.id && (
                <div className="flex gap-1 mt-1 bg-white p-1 rounded shadow">
                  <Button
                    onClick={() => {
                      recordHistory();
                      setImageElements((prev) =>
                        prev.filter((el) => el.id !== img.id)
                      );
                    }}
                  >
                    🗑️
                  </Button>
                  <Button
                    onClick={() =>
                      setImageElements((prev) =>
                        prev.map((el) =>
                          el.id === img.id ? { ...el, locked: !el.locked } : el
                        )
                      )
                    }
                  >
                    {img.locked ? "🔒" : "🔓"}
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
