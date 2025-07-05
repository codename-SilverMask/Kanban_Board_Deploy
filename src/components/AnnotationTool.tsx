import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Pen,
  Eraser,
  Download,
  Upload,
  Trash2,
  Move,
  Square,
} from "lucide-react";

interface Point {
  x: number;
  y: number;
}

interface DrawingPath {
  points: Point[];
  color: string;
  width: number;
  tool: "pen" | "eraser";
}

interface Polygon {
  id: string;
  points: Point[];
  color: string;
  width: number;
  closed: boolean;
}

interface AnnotationData {
  imageId: string;
  paths: DrawingPath[];
  polygons: Polygon[];
}

interface AnnotationToolProps {
  images?: string[];
}

const AnnotationTool: React.FC<AnnotationToolProps> = ({ images = [] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<
    "pen" | "eraser" | "move" | "polygon"
  >("pen");
  const [currentColor, setCurrentColor] = useState("#ef4444");
  const [currentWidth, setCurrentWidth] = useState(3);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [currentPolygon, setCurrentPolygon] = useState<Point[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });
  const [canvasOffset, setCanvasOffset] = useState<Point>({ x: 0, y: 0 });
  const [selectedPolygon, setSelectedPolygon] = useState<string | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Default sample images (updated to use SVG files)
  const defaultImages = [
    "/sample-images/sample1.svg",
    "/sample-images/sample2.svg",
    "/sample-images/sample3.svg",
    "/sample-images/sample4.svg",
    "/sample-images/sample5.svg",
  ];

  const allImages = [...defaultImages, ...images, ...uploadedImages];

  // localStorage utilities
  const saveAnnotationsToStorage = useCallback(
    (imageId: string, annotations: AnnotationData) => {
      localStorage.setItem(
        `annotation_${imageId}`,
        JSON.stringify(annotations)
      );
    },
    []
  );

  const loadAnnotationsFromStorage = useCallback(
    (imageId: string): AnnotationData | null => {
      const stored = localStorage.getItem(`annotation_${imageId}`);
      return stored ? JSON.parse(stored) : null;
    },
    []
  );

  const getCurrentImageId = () => {
    return allImages[currentImageIndex] || `image_${currentImageIndex}`;
  };

  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(
    null
  );

  const drawAnnotations = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      // Draw paths
      paths.forEach((path) => {
        if (path.points.length < 2) return;
        ctx.strokeStyle = path.color;
        ctx.lineWidth = path.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalCompositeOperation =
          path.tool === "eraser" ? "destination-out" : "source-over";
        ctx.beginPath();
        ctx.moveTo(path.points[0].x, path.points[0].y);
        for (let i = 1; i < path.points.length; i++) {
          ctx.lineTo(path.points[i].x, path.points[i].y);
        }
        ctx.stroke();
        // Reset composite operation
        ctx.globalCompositeOperation = "source-over";
      });

      // Draw current path (while drawing)
      if (currentPath.length > 1 && isDrawing) {
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalCompositeOperation =
          currentTool === "eraser" ? "destination-out" : "source-over";
        ctx.beginPath();
        ctx.moveTo(currentPath[0].x, currentPath[0].y);
        for (let i = 1; i < currentPath.length; i++) {
          ctx.lineTo(currentPath[i].x, currentPath[i].y);
        }
        ctx.stroke();
        // Reset composite operation
        ctx.globalCompositeOperation = "source-over";
      }

      // Draw polygons
      polygons.forEach((polygon) => {
        if (polygon.points.length < 2) return;
        ctx.strokeStyle = polygon.color;
        ctx.lineWidth = polygon.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        ctx.moveTo(polygon.points[0].x, polygon.points[0].y);
        for (let i = 1; i < polygon.points.length; i++) {
          ctx.lineTo(polygon.points[i].x, polygon.points[i].y);
        }
        if (polygon.closed && polygon.points.length > 2) {
          ctx.closePath();
        }
        ctx.stroke();

        // Draw control points
        polygon.points.forEach((point) => {
          ctx.fillStyle = polygon.color;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
          ctx.fill();
        });
      });

      // Draw current polygon
      if (currentPolygon.length > 0 && currentTool === "polygon") {
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalCompositeOperation = "source-over";
        if (currentPolygon.length > 1) {
          ctx.beginPath();
          ctx.moveTo(currentPolygon[0].x, currentPolygon[0].y);
          for (let i = 1; i < currentPolygon.length; i++) {
            ctx.lineTo(currentPolygon[i].x, currentPolygon[i].y);
          }
          ctx.stroke();
        }
        // Draw control points
        currentPolygon.forEach((point) => {
          ctx.fillStyle = currentColor;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
    },
    [
      paths,
      polygons,
      currentPolygon,
      currentTool,
      currentColor,
      currentWidth,
      currentPath,
      isDrawing,
    ]
  );

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context
    ctx.save();

    // Apply canvas offset for panning
    ctx.translate(canvasOffset.x, canvasOffset.y);

    // Draw current image if available
    if (currentImage) {
      const scale =
        Math.min(
          canvas.width / currentImage.width,
          canvas.height / currentImage.height
        ) * 0.8;
      const width = currentImage.width * scale;
      const height = currentImage.height * scale;
      const x = (canvas.width - width) / 2 - canvasOffset.x;
      const y = (canvas.height - height) / 2 - canvasOffset.y;

      ctx.drawImage(currentImage, x, y, width, height);
    }

    // Draw annotations
    drawAnnotations(ctx);

    // Restore context
    ctx.restore();
  }, [currentImage, canvasOffset, drawAnnotations]);

  // Load image when current image index changes
  useEffect(() => {
    if (allImages[currentImageIndex]) {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        setCurrentImage(img);
      };

      img.onerror = (error) => {
        console.error(
          `Failed to load image: ${allImages[currentImageIndex]}`,
          error
        );
        setCurrentImage(null);
      };

      img.src = allImages[currentImageIndex];
    } else {
      setCurrentImage(null);
    }
  }, [allImages, currentImageIndex]);

  // Load annotations when image changes
  useEffect(() => {
    const imageId = getCurrentImageId();
    const stored = loadAnnotationsFromStorage(imageId);
    if (stored) {
      setPaths(stored.paths);
      setPolygons(stored.polygons);
    } else {
      setPaths([]);
      setPolygons([]);
    }
    setCanvasOffset({ x: 0, y: 0 });
  }, [currentImageIndex, allImages, loadAnnotationsFromStorage]);

  // Save annotations whenever they change
  useEffect(() => {
    if (allImages.length > 0) {
      const imageId = getCurrentImageId();
      const annotations: AnnotationData = {
        imageId,
        paths,
        polygons,
      };
      saveAnnotationsToStorage(imageId, annotations);
    }
  }, [paths, polygons, currentImageIndex, allImages, saveAnnotationsToStorage]);

  // Redraw canvas when needed
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Additional redraw for smooth drawing during mouse move
  useEffect(() => {
    if (isDrawing && currentPath.length > 0) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(() => {
        redrawCanvas();
      });
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentPath, isDrawing, redrawCanvas]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsDrawing(false);
      setCurrentPath([]);
      setCurrentPolygon([]);
      setSelectedPolygon(null);
      setCurrentImage(null);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const isPointNearPolygon = (point: Point, polygon: Polygon): boolean => {
    const threshold = 10;
    return polygon.points.some(
      (polyPoint) =>
        Math.abs(polyPoint.x - point.x) < threshold &&
        Math.abs(polyPoint.y - point.y) < threshold
    );
  };

  const findPolygonAtPoint = (point: Point): string | null => {
    for (const polygon of polygons) {
      if (isPointNearPolygon(point, polygon)) {
        return polygon.id;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const pos = getMousePos(e);

    if (currentTool === "move") {
      setIsDragging(true);
      setDragStart(pos);
      return;
    }

    if (currentTool === "polygon") {
      // Check if clicking on an existing polygon for selection
      const clickedPolygon = findPolygonAtPoint(pos);
      if (clickedPolygon) {
        setSelectedPolygon(
          selectedPolygon === clickedPolygon ? null : clickedPolygon
        );
        return;
      }

      // Add point to current polygon
      setCurrentPolygon((prev) => [...prev, pos]);
      return;
    }

    // For pen and eraser tools
    console.log("Starting drawing with tool:", currentTool);
    setIsDrawing(true);
    setCurrentPath([pos]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const pos = getMousePos(e);

    if (currentTool === "move" && isDragging) {
      const deltaX = pos.x - dragStart.x;
      const deltaY = pos.y - dragStart.y;
      setCanvasOffset((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
      setDragStart(pos);
      return;
    }

    if (!isDrawing || currentTool === "polygon") return;

    console.log("Adding point to path:", pos);
    setCurrentPath((prev) => [...prev, pos]);
  };

  const handleMouseUp = (e?: React.MouseEvent<HTMLCanvasElement>) => {
    if (e) e.preventDefault();

    if (currentTool === "move") {
      setIsDragging(false);
      return;
    }

    if (currentTool === "polygon") {
      // Polygon creation is handled in mouseDown
      return;
    }

    if (isDrawing && currentPath.length > 1) {
      console.log("Completing path with", currentPath.length, "points");
      const newPath: DrawingPath = {
        points: currentPath,
        color: currentColor,
        width: currentWidth,
        tool: currentTool === "eraser" ? "eraser" : "pen",
      };

      setPaths((prev) => [...prev, newPath]);
    }

    setIsDrawing(false);
    setCurrentPath([]);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (currentTool === "polygon" && currentPolygon.length >= 3) {
      completePolygon();
    }
  };

  const completePolygon = () => {
    if (currentTool === "polygon" && currentPolygon.length >= 3) {
      // Complete the polygon
      const newPolygon: Polygon = {
        id: `polygon_${Date.now()}_${Math.random()}`,
        points: [...currentPolygon],
        color: currentColor,
        width: currentWidth,
        closed: true,
      };

      setPolygons((prev) => [...prev, newPolygon]);
      setCurrentPolygon([]);
    }
  };

  const deleteSelectedPolygon = () => {
    if (selectedPolygon) {
      setPolygons((prev) => prev.filter((p) => p.id !== selectedPolygon));
      setSelectedPolygon(null);
    }
  };

  const clearCanvas = () => {
    setPaths([]);
    setPolygons([]);
    setCurrentPath([]);
    setCurrentPolygon([]);
    setSelectedPolygon(null);
    setCanvasOffset({ x: 0, y: 0 });
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `annotation-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImages((prev) => [
            ...prev,
            event.target!.result as string,
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const nextImage = () => {
    if (currentImageIndex < allImages.length - 1) {
      setCurrentImageIndex((prev) => prev + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="annotation-tool">
      <div className="annotation-header">
        <h1>Annotation Tool</h1>
        <p>Draw, annotate, and create polygons on images</p>
      </div>

      <div className="annotation-toolbar">
        <div className="tool-group">
          <button
            className={`tool-btn ${currentTool === "pen" ? "active" : ""}`}
            onClick={() => {
              setCurrentTool("pen");
              setCurrentPolygon([]);
              setSelectedPolygon(null);
            }}
            title="Pen Tool"
          >
            <Pen size={20} />
          </button>
          <button
            className={`tool-btn ${currentTool === "eraser" ? "active" : ""}`}
            onClick={() => {
              setCurrentTool("eraser");
              setCurrentPolygon([]);
              setSelectedPolygon(null);
            }}
            title="Eraser Tool"
          >
            <Eraser size={20} />
          </button>
          <button
            className={`tool-btn ${currentTool === "polygon" ? "active" : ""}`}
            onClick={() => {
              setCurrentTool("polygon");
              setCurrentPath([]);
            }}
            title="Polygon Tool"
          >
            <Square size={20} />
          </button>
          <button
            className={`tool-btn ${currentTool === "move" ? "active" : ""}`}
            onClick={() => {
              setCurrentTool("move");
              setCurrentPolygon([]);
              setSelectedPolygon(null);
            }}
            title="Move Tool"
          >
            <Move size={20} />
          </button>
        </div>

        <div className="tool-group">
          <label className="color-picker-label">
            Color:
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              className="color-picker"
            />
          </label>

          <label className="width-slider-label">
            Width:
            <input
              type="range"
              min="1"
              max="20"
              value={currentWidth}
              onChange={(e) => setCurrentWidth(Number(e.target.value))}
              className="width-slider"
            />
            <span className="width-value">{currentWidth}px</span>
          </label>
        </div>

        <div className="tool-group">
          {selectedPolygon && (
            <button
              className="tool-btn danger"
              onClick={deleteSelectedPolygon}
              title="Delete Selected Polygon"
            >
              <Trash2 size={20} />
              Delete Polygon
            </button>
          )}

          {currentTool === "polygon" && currentPolygon.length >= 3 && (
            <button
              className="tool-btn success"
              onClick={completePolygon}
              title="Complete Polygon"
            >
              ✓ Complete
            </button>
          )}

          <label className="upload-btn">
            <Upload size={20} />
            Upload Images
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </label>

          <button className="tool-btn" onClick={downloadImage} title="Download">
            <Download size={20} />
          </button>

          <button
            className="tool-btn danger"
            onClick={clearCanvas}
            title="Clear All"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {currentTool === "polygon" && (
        <div className="polygon-instructions">
          <p>
            <strong>Polygon Mode:</strong> Click to add points. Click "Complete"
            or double-click when done (min 3 points). Click existing polygons to
            select/deselect them.
          </p>
        </div>
      )}

      {allImages.length > 0 && (
        <div className="image-navigation">
          <button
            onClick={prevImage}
            disabled={currentImageIndex === 0}
            className="nav-btn"
          >
            ← Previous
          </button>
          <span className="image-counter">
            {currentImageIndex + 1} of {allImages.length}
          </span>
          <button
            onClick={nextImage}
            disabled={currentImageIndex === allImages.length - 1}
            className="nav-btn"
          >
            Next →
          </button>
        </div>
      )}

      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="annotation-canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          style={{ cursor: currentTool === "move" ? "move" : "crosshair" }}
        />

        {allImages.length === 0 && (
          <div className="canvas-placeholder">
            <p>Upload images to start annotating</p>
            <label className="upload-placeholder-btn">
              Choose Images
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnotationTool;
