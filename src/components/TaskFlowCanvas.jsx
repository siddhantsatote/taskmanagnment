import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Workflow,
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  MousePointer,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ArrowRight,
  Download,
  Share2,
  Maximize2,
  X,
  Tag,
  Palette,
  Eye,
  Check,
  Zap,
  ChevronRight,
  ChevronLeft,
  FileText
} from 'lucide-react';
import { formatIndianDate } from '../lib/supabase';

// Local storage key for persistent canvas state
const CANVAS_STORAGE_KEY = 'taskflow_canvas_state_v2';

export default function TaskFlowCanvas({
  tasks = [],
  employees = [],
  teams = [],
  onSelectTask,
  onToggleTaskStatus,
  onOpenNewTaskModal,
  currentUser
}) {
  // Employee and Team maps
  const empMap = useMemo(() => {
    return (employees || []).reduce((acc, emp) => {
      acc[emp.id] = emp;
      return acc;
    }, {});
  }, [employees]);

  // Canvas Viewport Transformation (Pan & Zoom)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState('select'); // 'select' | 'pan' | 'connect'

  // Canvas Tray collapse
  const [isTrayOpen, setIsTrayOpen] = useState(true);
  const [trayTab, setTrayTab] = useState('tasks'); // 'tasks' | 'shapes' | 'templates'
  const [traySearch, setTraySearch] = useState('');

  // Connecting line in progress (from node to mouse position)
  const [connectingFrom, setConnectingFrom] = useState(null); // nodeId
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Selected node
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // Nodes & Edges state
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  // Node Dragging state
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);

  // Pre-built Demo Templates
  const templates = {
    upiPipeline: {
      name: '💳 UPI & Razorpay Gateway Pipeline',
      description: 'Full-stack architecture from webhook deployment to live sandbox settlement',
      nodes: [
        {
          id: 'node-arch',
          type: 'process',
          title: 'Architecture & Webhook Specs',
          desc: 'Define payload structure and Axis Bank gateway secrets',
          status: 'Done',
          priority: 'High',
          assignee_id: 'emp-2',
          tag: 'UPI Payments',
          color: '#3B82F6',
          x: 80,
          y: 120
        },
        {
          id: 'node-webhook',
          type: 'process',
          taskId: 'task-103',
          title: 'Integrate Razorpay Webhooks v3',
          desc: 'Deploy auto-reconciliation webhook handler for instant UPI QR payments',
          status: 'In Progress',
          priority: 'High',
          assignee_id: 'emp-2',
          tag: 'UPI Payments',
          color: '#3B82F6',
          x: 420,
          y: 120
        },
        {
          id: 'node-decision',
          type: 'decision',
          title: 'Zero Latency Audit Passed?',
          desc: 'Confirm 100% success rate on 15 concurrent test transactions',
          status: 'Pending',
          priority: 'Urgent',
          assignee_id: 'emp-2',
          tag: 'Tech Sprint',
          color: '#F56B2C',
          x: 760,
          y: 105
        },
        {
          id: 'node-prod',
          type: 'milestone',
          title: 'Production Merchant Rollout 🚀',
          desc: 'Switch to live Razorpay keys and announce on merchant dashboard',
          status: 'Pending',
          priority: 'High',
          assignee_id: 'emp-1',
          tag: 'Operations',
          color: '#10B981',
          x: 1080,
          y: 120
        },
        {
          id: 'node-sticky-1',
          type: 'sticky',
          title: '💡 Dev Note',
          desc: 'Ensure Axis Bank v3 callback handles 200 OK within 400ms to avoid auto-retry spam.',
          color: '#FEF08A',
          x: 420,
          y: 340
        }
      ],
      edges: [
        { id: 'edge-1', from: 'node-arch', to: 'node-webhook', label: 'Specs Approved' },
        { id: 'edge-2', from: 'node-webhook', to: 'node-decision', label: 'Sandbox Built' },
        { id: 'edge-3', from: 'node-decision', to: 'node-prod', label: 'Yes (Latency < 500ms)' }
      ]
    },
    gstCycle: {
      name: '📑 GST & Statutory Compliance Cycle',
      description: 'End-to-end reconciliation for GSTR-3B and TDS Form 26AS before CA signoff',
      nodes: [
        {
          id: 'gst-1',
          type: 'process',
          title: 'GSTR-2B Vendor Purchase Recon',
          desc: 'Reconcile supplier invoices against GST portal ledger',
          status: 'Done',
          priority: 'Urgent',
          assignee_id: 'emp-3',
          tag: 'GST & Compliance',
          color: '#10B981',
          x: 80,
          y: 100
        },
        {
          id: 'gst-2',
          type: 'process',
          taskId: 'task-101',
          title: 'GSTR-3B Filing & ITC Verification',
          desc: 'Verify purchase invoices against supplier uploads on GST Portal',
          status: 'In Progress',
          priority: 'Urgent',
          assignee_id: 'emp-3',
          tag: 'GST & Compliance',
          color: '#10B981',
          x: 420,
          y: 100
        },
        {
          id: 'gst-3',
          type: 'process',
          taskId: 'task-105',
          title: 'TDS Reconciliation with TRACES Form 26AS',
          desc: 'Reconcile vendor TDS deducted under Section 194C & 194J',
          status: 'Pending',
          priority: 'Medium',
          assignee_id: 'emp-3',
          tag: 'Income Tax TDS',
          color: '#10B981',
          x: 420,
          y: 300
        },
        {
          id: 'gst-4',
          type: 'decision',
          title: 'CA Audit Sign-off',
          desc: 'Validate ₹14.8 Lakh ITC claim without mismatch notice risk',
          status: 'Pending',
          priority: 'High',
          assignee_id: 'emp-3',
          tag: 'GST & Compliance',
          color: '#F56B2C',
          x: 780,
          y: 180
        },
        {
          id: 'gst-5',
          type: 'milestone',
          title: 'Challan Paid & Portal Acknowledgment',
          desc: 'Generate official GSTIN Challan receipt and archive in Drive',
          status: 'Pending',
          priority: 'High',
          assignee_id: 'emp-3',
          tag: 'GST & Compliance',
          color: '#10B981',
          x: 1100,
          y: 180
        }
      ],
      edges: [
        { id: 'edge-g1', from: 'gst-1', to: 'gst-2', label: 'Match Verified' },
        { id: 'edge-g2', from: 'gst-2', to: 'gst-4', label: 'GSTR ITC Ready' },
        { id: 'edge-g3', from: 'gst-3', to: 'gst-4', label: 'TDS Checked' },
        { id: 'edge-g4', from: 'gst-4', to: 'gst-5', label: 'Audit Signed' }
      ]
    },
    growthFunnel: {
      name: '🚀 Festive Sale & Corporate Onboarding',
      description: 'Campaign creatives, Hindi localization, and client onboarding roadmap',
      nodes: [
        {
          id: 'gf-1',
          type: 'process',
          taskId: 'task-104',
          title: 'Diwali Festive Sale Creatives & Banners',
          desc: 'Design responsive homepage hero banners and WhatsApp templates',
          status: 'Pending',
          priority: 'Medium',
          assignee_id: 'emp-1',
          tag: 'Festive Campaign',
          color: '#EC4899',
          x: 80,
          y: 100
        },
        {
          id: 'gf-2',
          type: 'process',
          taskId: 'task-109',
          title: 'Mobile App Hindi Localization',
          desc: 'Translate onboarding strings into Hindi and Marathi',
          status: 'Done',
          priority: 'Medium',
          assignee_id: 'emp-1',
          tag: 'Localization',
          color: '#8B5CF6',
          x: 80,
          y: 280
        },
        {
          id: 'gf-3',
          type: 'process',
          taskId: 'task-107',
          title: 'B2B Founder Outreach on LinkedIn',
          desc: 'Outbound campaign targeting 150 D2C brands across Mumbai & Gurugram',
          status: 'Pending',
          priority: 'Low',
          assignee_id: 'emp-5',
          tag: 'B2B Sales',
          color: '#8B5CF6',
          x: 440,
          y: 190
        },
        {
          id: 'gf-4',
          type: 'process',
          taskId: 'task-102',
          title: 'Client Onboarding: Bangalore Retail Tech',
          desc: 'Finalize Master Services Agreement (MSA) and founder kickoff call',
          status: 'Pending',
          priority: 'High',
          assignee_id: 'emp-4',
          tag: 'Client Deliverable',
          color: '#F56B2C',
          x: 800,
          y: 190
        },
        {
          id: 'gf-5',
          type: 'milestone',
          title: 'Enterprise Annual Contract Closed 🤝',
          desc: 'Receive advance deposit into HDFC current account',
          status: 'Pending',
          priority: 'Urgent',
          assignee_id: 'emp-4',
          tag: 'B2B Sales',
          color: '#10B981',
          x: 1120,
          y: 190
        }
      ],
      edges: [
        { id: 'edge-gf1', from: 'gf-1', to: 'gf-3', label: 'Assets Live' },
        { id: 'edge-gf2', from: 'gf-2', to: 'gf-3', label: 'App Ready' },
        { id: 'edge-gf3', from: 'gf-3', to: 'gf-4', label: 'Demo Booked' },
        { id: 'edge-gf4', from: 'gf-4', to: 'gf-5', label: 'Terms Agreed' }
      ]
    }
  };

  // Initialize Canvas from storage or fallback to UPI template
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CANVAS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.nodes && parsed.nodes.length > 0) {
          setNodes(parsed.nodes);
          setEdges(parsed.edges || []);
          return;
        }
      }
    } catch (e) {
      console.warn('Canvas storage load failed:', e);
    }

    // Default template: UPI Pipeline
    setNodes(templates.upiPipeline.nodes);
    setEdges(templates.upiPipeline.edges);
  }, []);

  // Listen for AI-generated canvas events
  useEffect(() => {
    const handleLoadAICanvas = (e) => {
      if (e.detail?.nodes && Array.isArray(e.detail.nodes)) {
        setNodes(e.detail.nodes);
        setEdges(e.detail.edges || []);
        setPan({ x: 60, y: 60 });
        setZoom(1);
      }
    };
    window.addEventListener('taskflow_load_ai_canvas', handleLoadAICanvas);
    return () => window.removeEventListener('taskflow_load_ai_canvas', handleLoadAICanvas);
  }, []);

  // Save Canvas to localStorage whenever nodes or edges update
  useEffect(() => {
    if (nodes.length > 0) {
      try {
        localStorage.setItem(
          CANVAS_STORAGE_KEY,
          JSON.stringify({ nodes, edges, updated_at: new Date().toISOString() })
        );
      } catch (e) {}
    }
  }, [nodes, edges]);

  // Load a template
  const handleLoadTemplate = (tplKey) => {
    const tpl = templates[tplKey];
    if (tpl) {
      setNodes(tpl.nodes);
      setEdges(tpl.edges);
      setPan({ x: 60, y: 60 });
      setZoom(1);
    }
  };

  // Drop a Task or Shape onto Canvas
  const handleDropOnCanvas = (e) => {
    e.preventDefault();
    const rawData = e.dataTransfer.getData('application/json');
    if (!rawData) return;

    try {
      const payload = JSON.parse(rawData);
      const rect = canvasRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      // Transform client coordinates to canvas world coordinates
      const worldX = (clientX - pan.x) / zoom;
      const worldY = (clientY - pan.y) / zoom;

      if (payload.type === 'TASK') {
        const t = payload.task;
        const newNode = {
          id: 'node-' + Date.now().toString(36),
          type: 'process',
          taskId: t.id,
          title: t.title,
          desc: t.description || '',
          status: t.status,
          priority: t.priority,
          assignee_id: t.assignee_id,
          assignee_ids: t.assignee_ids || (t.assignee_id ? [t.assignee_id] : []),
          team_name: t.team_name,
          tag: t.tag || 'General',
          color: t.team_name ? '#3B82F6' : '#F56B2C',
          x: Math.round(worldX - 120),
          y: Math.round(worldY - 50)
        };
        setNodes((prev) => [...prev, newNode]);
      } else if (payload.type === 'SHAPE') {
        const shapeType = payload.shape;
        const newNode = {
          id: 'shape-' + Date.now().toString(36),
          type: shapeType,
          title:
            shapeType === 'decision'
              ? 'Condition / Approval Check?'
              : shapeType === 'milestone'
              ? 'Key Milestone Achieved'
              : shapeType === 'sticky'
              ? '📌 Brainstorming Note'
              : 'New Workflow Step',
          desc: shapeType === 'sticky' ? 'Type feedback, WhatsApp updates or architecture specs...' : '',
          status: 'Pending',
          priority: 'Medium',
          color:
            shapeType === 'sticky'
              ? '#FEF08A'
              : shapeType === 'decision'
              ? '#F56B2C'
              : shapeType === 'milestone'
              ? '#10B981'
              : '#3B82F6',
          x: Math.round(worldX - 100),
          y: Math.round(worldY - 40)
        };
        setNodes((prev) => [...prev, newNode]);
      }
    } catch (err) {
      console.error('Error dropping item on canvas:', err);
    }
  };

  // Start Pan Canvas
  const handleMouseDownCanvas = (e) => {
    // Only pan if clicking canvas background (not a node)
    if (e.target.closest('.canvas-node-card') || e.target.closest('.canvas-tray') || e.target.closest('.canvas-toolbar')) {
      return;
    }

    if (activeTool === 'pan' || e.button === 1 || e.spaceKey || e.button === 0) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
    setSelectedNodeId(null);
    setConnectingFrom(null);
  };

  // Mouse Move on Canvas
  const handleMouseMoveCanvas = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const worldX = (e.clientX - rect.left - pan.x) / zoom;
      const worldY = (e.clientY - rect.top - pan.y) / zoom;
      setMousePos({ x: worldX, y: worldY });
    }

    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
      return;
    }

    if (draggingNodeId) {
      const rect = canvasRef.current.getBoundingClientRect();
      const curWorldX = (e.clientX - rect.left - pan.x) / zoom;
      const curWorldY = (e.clientY - rect.top - pan.y) / zoom;

      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggingNodeId
            ? {
                ...n,
                x: Math.round(curWorldX - dragOffset.x),
                y: Math.round(curWorldY - dragOffset.y)
              }
            : n
        )
      );
    }
  };

  const handleMouseUpCanvas = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  // Start dragging a node
  const handleStartDragNode = (e, node) => {
    e.stopPropagation();
    if (connectingFrom) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const curWorldX = (e.clientX - rect.left - pan.x) / zoom;
    const curWorldY = (e.clientY - rect.top - pan.y) / zoom;

    setDraggingNodeId(node.id);
    setSelectedNodeId(node.id);
    setDragOffset({
      x: curWorldX - node.x,
      y: curWorldY - node.y
    });
  };

  // Handle connector link creation
  const handleStartConnect = (e, nodeId) => {
    e.stopPropagation();
    setConnectingFrom(nodeId);
  };

  const handleFinishConnect = (e, targetNodeId) => {
    e.stopPropagation();
    if (connectingFrom && connectingFrom !== targetNodeId) {
      // Check if edge already exists
      const exists = edges.some(
        (edge) => edge.from === connectingFrom && edge.to === targetNodeId
      );
      if (!exists) {
        const newEdge = {
          id: 'edge-' + Date.now().toString(36),
          from: connectingFrom,
          to: targetNodeId,
          label: ''
        };
        setEdges((prev) => [...prev, newEdge]);
      }
    }
    setConnectingFrom(null);
  };

  // Add next connected step with 1 click
  const handleAddConnectedStep = (sourceNode) => {
    const newNodeId = 'node-' + Date.now().toString(36);
    const newNode = {
      id: newNodeId,
      type: 'process',
      title: 'Next Deliverable Step',
      desc: 'Sub-task spawned from ' + sourceNode.title,
      status: 'Pending',
      priority: 'Medium',
      color: sourceNode.color || '#3B82F6',
      x: sourceNode.x + 320,
      y: sourceNode.y
    };

    const newEdge = {
      id: 'edge-' + Date.now().toString(36),
      from: sourceNode.id,
      to: newNodeId,
      label: 'Proceed'
    };

    setNodes((prev) => [...prev, newNode]);
    setEdges((prev) => [...prev, newEdge]);
    setSelectedNodeId(newNodeId);
  };

  // Delete node
  const handleDeleteNode = (nodeId) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.from !== nodeId && e.to !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  // Delete edge
  const handleDeleteEdge = (edgeId) => {
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
  };

  // Toggle status of a canvas node
  const handleNodeToggleStatus = (node) => {
    const nextStatus = node.status === 'Done' ? 'Pending' : node.status === 'Pending' ? 'In Progress' : 'Done';
    setNodes((prev) =>
      prev.map((n) => (n.id === node.id ? { ...n, status: nextStatus } : n))
    );

    // If node is linked to an actual database task, update it
    if (node.taskId && onToggleTaskStatus) {
      onToggleTaskStatus(node.taskId, nextStatus);
    }
  };

  // Auto-arrange flowchart layout (Left-to-Right layout)
  const handleAutoLayout = () => {
    // Basic topological ordering based on edges
    const inDegree = {};
    nodes.forEach((n) => (inDegree[n.id] = 0));
    edges.forEach((e) => {
      if (inDegree[e.to] !== undefined) inDegree[e.to]++;
    });

    // Group into levels
    const levels = [];
    let currentLevel = nodes.filter((n) => inDegree[n.id] === 0).map((n) => n.id);
    if (currentLevel.length === 0 && nodes.length > 0) {
      currentLevel = [nodes[0].id];
    }

    const visited = new Set();
    while (currentLevel.length > 0) {
      levels.push(currentLevel);
      currentLevel.forEach((id) => visited.add(id));

      const nextLevel = [];
      currentLevel.forEach((srcId) => {
        edges
          .filter((e) => e.from === srcId)
          .forEach((e) => {
            if (!visited.has(e.to) && !nextLevel.includes(e.to)) {
              nextLevel.push(e.to);
            }
          });
      });
      currentLevel = nextLevel;
    }

    // Add unvisited nodes
    const unvisited = nodes.filter((n) => !visited.has(n.id)).map((n) => n.id);
    if (unvisited.length > 0) {
      levels.push(unvisited);
    }

    // Apply layout coordinates
    const newPositions = {};
    levels.forEach((lvl, colIdx) => {
      lvl.forEach((nodeId, rowIdx) => {
        newPositions[nodeId] = {
          x: 80 + colIdx * 340,
          y: 80 + rowIdx * 190
        };
      });
    });

    setNodes((prev) =>
      prev.map((n) => (newPositions[n.id] ? { ...n, ...newPositions[n.id] } : n))
    );
  };

  // Node position helper for calculating SVG arrow paths
  const getNodeCenter = (nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return { x: 0, y: 0, right: 0, left: 0, top: 0, bottom: 0 };
    const width = node.type === 'sticky' ? 200 : node.type === 'decision' ? 220 : 250;
    const height = node.type === 'sticky' ? 140 : node.type === 'decision' ? 150 : 130;

    return {
      x: node.x + width / 2,
      y: node.y + height / 2,
      left: node.x,
      right: node.x + width,
      top: node.y,
      bottom: node.y + height,
      width,
      height
    };
  };

  // Filter tasks in tray
  const filteredTrayTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!traySearch.trim()) return true;
      const q = traySearch.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        (t.tag || '').toLowerCase().includes(q) ||
        (t.team_name || '').toLowerCase().includes(q)
      );
    });
  }, [tasks, traySearch]);

  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 120px)',
        position: 'relative',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        border: '1px solid var(--border-light)',
        background: '#F8FAFC',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      {/* =========================================================================
          LEFT COLLAPSIBLE TRAY (Tasks Backlog & Shape Palette like Figma / Miro)
          ========================================================================= */}
      <div
        className="canvas-tray"
        style={{
          width: isTrayOpen ? '320px' : '0px',
          background: '#FFFFFF',
          borderRight: isTrayOpen ? '1px solid var(--border-light)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
          zIndex: 20,
          position: 'relative'
        }}
      >
        {/* Tray Header */}
        <div
          style={{
            padding: '16px 18px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Workflow size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>
                Workflow Tray
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Drag blocks onto canvas</p>
            </div>
          </div>

          <button
            className="action-icon-btn"
            onClick={() => setIsTrayOpen(false)}
            title="Collapse tray"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Tray Tabs */}
        <div
          style={{
            display: 'flex',
            background: '#F1F5F9',
            padding: '4px',
            margin: '12px 14px 8px',
            borderRadius: '10px'
          }}
        >
          <button
            type="button"
            onClick={() => setTrayTab('tasks')}
            style={{
              flex: 1,
              padding: '6px 8px',
              fontSize: '12px',
              fontWeight: '700',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: trayTab === 'tasks' ? '#FFFFFF' : 'transparent',
              color: trayTab === 'tasks' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: trayTab === 'tasks' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            Tasks ({tasks.length})
          </button>

          <button
            type="button"
            onClick={() => setTrayTab('shapes')}
            style={{
              flex: 1,
              padding: '6px 8px',
              fontSize: '12px',
              fontWeight: '700',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: trayTab === 'shapes' ? '#FFFFFF' : 'transparent',
              color: trayTab === 'shapes' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: trayTab === 'shapes' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            Shapes & Notes
          </button>

          <button
            type="button"
            onClick={() => setTrayTab('templates')}
            style={{
              flex: 1,
              padding: '6px 8px',
              fontSize: '12px',
              fontWeight: '700',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: trayTab === 'templates' ? '#FFFFFF' : 'transparent',
              color: trayTab === 'templates' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: trayTab === 'templates' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            Templates
          </button>
        </div>

        {/* TRAY TAB CONTENT */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* TAB 1: REAL PROJECT TASKS */}
          {trayTab === 'tasks' && (
            <>
              <input
                type="text"
                className="form-input"
                placeholder="Search tasks..."
                value={traySearch}
                onChange={(e) => setTraySearch(e.target.value)}
                style={{ height: '34px', fontSize: '12px', marginBottom: '6px' }}
              />

              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase' }}>
                Drag Task into Flowchart:
              </span>

              {filteredTrayTasks.map((t) => {
                const assignee = empMap[t.assignee_id];
                return (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify({ type: 'TASK', task: t }));
                    }}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid var(--border-light)',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      cursor: 'grab',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-light)')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: '800',
                          color: '#475569',
                          background: '#F1F5F9',
                          padding: '1px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        {t.tag || 'General'}
                      </span>
                      <span className={`priority-pill priority-${t.priority.toLowerCase()}`} style={{ fontSize: '9px' }}>
                        {t.priority}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.3' }}>
                      {t.title}
                    </h4>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                      {t.team_name ? (
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#0369A1' }}>
                          👥 {t.team_name.split(' ')[0]} Squad
                        </span>
                      ) : assignee ? (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          👤 {assignee.name.split(' ')[0]}
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Unassigned</span>
                      )}

                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* TAB 2: FLOWCHART SHAPES & STICKY NOTES */}
          {trayTab === 'shapes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase' }}>
                Drag Shape to Diagram:
              </span>

              {/* 1. Process Block */}
              <div
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify({ type: 'SHAPE', shape: 'process' }));
                }}
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #3B82F6',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  cursor: 'grab',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <div style={{ width: '18px', height: '14px', background: '#3B82F6', borderRadius: '3px' }} />
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    Process / Action Block
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Standard rectangular work item</p>
                </div>
              </div>

              {/* 2. Decision Diamond */}
              <div
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify({ type: 'SHAPE', shape: 'decision' }));
                }}
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #F56B2C',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  cursor: 'grab',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <div style={{ width: '14px', height: '14px', background: '#F56B2C', transform: 'rotate(45deg)' }} />
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    Decision / Condition
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Yes/No approval branch</p>
                </div>
              </div>

              {/* 3. Milestone Gate */}
              <div
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify({ type: 'SHAPE', shape: 'milestone' }));
                }}
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #10B981',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  cursor: 'grab',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#10B981' }} />
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    Milestone / Delivery Gate
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Key project deliverable release</p>
                </div>
              </div>

              {/* 4. Pastel Sticky Note */}
              <div
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify({ type: 'SHAPE', shape: 'sticky' }));
                }}
                style={{
                  background: '#FEF08A',
                  border: '1px solid #FDE047',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  cursor: 'grab',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <span style={{ fontSize: '16px' }}>📝</span>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#854D0E' }}>
                    Post-It Sticky Note
                  </h4>
                  <p style={{ fontSize: '11px', color: '#A16207' }}>Brainstorming & specs reminder</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TEMPLATES */}
          {trayTab === 'templates' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase' }}>
                Load Pre-Built Flowchart:
              </span>

              {Object.entries(templates).map(([key, tpl]) => (
                <div
                  key={key}
                  onClick={() => handleLoadTemplate(key)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--border-light)',
                    borderRadius: '10px',
                    padding: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-light)')}
                >
                  <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {tpl.name}
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                    {tpl.description}
                  </p>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: 'var(--primary)',
                      marginTop: '8px'
                    }}
                  >
                    <span>Load Diagram</span>
                    <ArrowRight size={12} />
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TRAY EXPAND BUTTON (when tray is collapsed) */}
      {!isTrayOpen && (
        <button
          onClick={() => setIsTrayOpen(true)}
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            zIndex: 30,
            background: '#FFFFFF',
            border: '1px solid var(--border-light)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderRadius: '10px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            color: 'var(--text-primary)'
          }}
        >
          <Workflow size={15} style={{ color: 'var(--primary)' }} />
          <span>Open Tray</span>
        </button>
      )}

      {/* =========================================================================
          MAIN WHITEBOARD CANVAS AREA (Infinite Dot Grid Engine)
          ========================================================================= */}
      <div
        ref={canvasRef}
        className="canvas-viewport"
        onMouseDown={handleMouseDownCanvas}
        onMouseMove={handleMouseMoveCanvas}
        onMouseUp={handleMouseUpCanvas}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropOnCanvas}
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          cursor: isPanning ? 'grabbing' : activeTool === 'pan' ? 'grab' : 'default',
          backgroundImage: 'radial-gradient(#CBD5E1 1.2px, transparent 1.2px)',
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`
        }}
      >
        {/* =========================================================================
            TOP FLOATING TOOLBAR (Miro / Figma style controls)
            ========================================================================= */}
        <div
          className="canvas-toolbar"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 30,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-light)',
            borderRadius: '12px',
            padding: '6px 10px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}
        >
          {/* Tool switchers */}
          <div style={{ display: 'flex', gap: '4px', borderRight: '1px solid var(--border-light)', paddingRight: '8px' }}>
            <button
              className="action-icon-btn"
              onClick={() => setActiveTool('select')}
              style={{
                background: activeTool === 'select' ? 'var(--primary-light)' : 'transparent',
                color: activeTool === 'select' ? 'var(--primary)' : 'var(--text-secondary)'
              }}
              title="Select / Move Nodes"
            >
              <MousePointer size={16} />
            </button>

            <button
              className="action-icon-btn"
              onClick={() => setActiveTool('pan')}
              style={{
                background: activeTool === 'pan' ? 'var(--primary-light)' : 'transparent',
                color: activeTool === 'pan' ? 'var(--primary)' : 'var(--text-secondary)'
              }}
              title="Hand / Pan Canvas"
            >
              <Move size={16} />
            </button>
          </div>

          {/* Quick Flowchart Layout */}
          <button
            className="btn-secondary"
            onClick={handleAutoLayout}
            style={{ height: '32px', fontSize: '11px', padding: '0 10px' }}
            title="Auto-arrange tasks in logical flowchart order"
          >
            <Sparkles size={13} style={{ color: 'var(--primary)' }} />
            <span>Auto Layout</span>
          </button>

          {/* Zoom controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', borderLeft: '1px solid var(--border-light)', paddingLeft: '8px' }}>
            <button
              className="action-icon-btn"
              onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
              title="Zoom out"
            >
              <ZoomOut size={15} />
            </button>

            <span style={{ fontSize: '12px', fontWeight: '700', minWidth: '40px', textAlign: 'center' }}>
              {Math.round(zoom * 100)}%
            </span>

            <button
              className="action-icon-btn"
              onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
              title="Zoom in"
            >
              <ZoomIn size={15} />
            </button>

            <button
              className="action-icon-btn"
              onClick={() => {
                setZoom(1);
                setPan({ x: 40, y: 40 });
              }}
              title="Reset 100%"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Create Task button */}
          <button
            className="btn-primary"
            onClick={() => onOpenNewTaskModal && onOpenNewTaskModal()}
            style={{ height: '32px', fontSize: '12px', padding: '0 12px', marginLeft: '6px' }}
          >
            <Plus size={14} />
            <span>New Task</span>
          </button>
        </div>

        {/* =========================================================================
            CANVAS SVG LAYER: Directional Connectors & Flowchart Edges
            ========================================================================= */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 5
          }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="8"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#64748B" />
            </marker>
            <marker
              id="arrowhead-active"
              markerWidth="10"
              markerHeight="7"
              refX="8"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#F56B2C" />
            </marker>
          </defs>

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Render established edges */}
            {edges.map((edge) => {
              const src = getNodeCenter(edge.from);
              const dst = getNodeCenter(edge.to);

              if (!src || !dst) return null;

              // Calculate start and end points
              const startX = src.right;
              const startY = src.y;
              const endX = dst.left;
              const endY = dst.y;

              // Control points for smooth bezier curve
              const dx = Math.abs(endX - startX) * 0.5;
              const pathD = `M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`;

              // Midpoint for badge label
              const midX = (startX + endX) / 2;
              const midY = (startY + endY) / 2;

              return (
                <g key={edge.id} style={{ pointerEvents: 'auto' }}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="2.5"
                    strokeDasharray={edge.label?.includes('No') ? '4 4' : 'none'}
                    markerEnd="url(#arrowhead)"
                    className="canvas-flow-edge"
                  />

                  {/* Edge label pill */}
                  {edge.label && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-45"
                        y="-10"
                        width="90"
                        height="20"
                        rx="10"
                        fill="#FFFFFF"
                        stroke="#CBD5E1"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="700"
                        fill="#475569"
                      >
                        {edge.label}
                      </text>
                    </g>
                  )}

                  {/* Quick delete edge button on midpoint */}
                  <circle
                    cx={midX}
                    cy={edge.label ? midY - 14 : midY}
                    r="8"
                    fill="#FEE2E2"
                    stroke="#EF4444"
                    strokeWidth="1"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleDeleteEdge(edge.id)}
                  >
                    <title>Delete connection arrow</title>
                  </circle>
                  <text
                    cx={midX}
                    cy={edge.label ? midY - 11 : midY + 3}
                    x={midX}
                    y={edge.label ? midY - 11 : midY + 3}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="800"
                    fill="#B91C1C"
                    style={{ pointerEvents: 'none' }}
                  >
                    ×
                  </text>
                </g>
              );
            })}

            {/* Render connecting line in progress */}
            {connectingFrom && (
              (() => {
                const src = getNodeCenter(connectingFrom);
                const pathD = `M ${src.right} ${src.y} C ${src.right + 60} ${src.y}, ${mousePos.x - 60} ${mousePos.y}, ${mousePos.x} ${mousePos.y}`;
                return (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#F56B2C"
                    strokeWidth="3"
                    strokeDasharray="5 5"
                    markerEnd="url(#arrowhead-active)"
                  />
                );
              })()
            )}
          </g>
        </svg>

        {/* =========================================================================
            CANVAS NODES HTML LAYER (Interactive Draggable Cards)
            ========================================================================= */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            zIndex: 10
          }}
        >
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const assignee = empMap[node.assignee_id];

            // 1. STICKY NOTE STYLE
            if (node.type === 'sticky') {
              return (
                <div
                  key={node.id}
                  className="canvas-node-card"
                  onMouseDown={(e) => handleStartDragNode(e, node)}
                  style={{
                    position: 'absolute',
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: '200px',
                    minHeight: '130px',
                    background: node.color || '#FEF08A',
                    boxShadow: isSelected ? '0 12px 30px rgba(0,0,0,0.18)' : '0 6px 18px rgba(0,0,0,0.08)',
                    borderRadius: '4px',
                    padding: '12px 14px',
                    border: isSelected ? '2px solid #CA8A04' : '1px solid rgba(0,0,0,0.08)',
                    cursor: 'grab',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transform: isSelected ? 'scale(1.02)' : 'none',
                    transition: 'box-shadow 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#854D0E' }}>
                      {node.title}
                    </span>
                    <button
                      type="button"
                      className="action-icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNode(node.id);
                      }}
                      style={{ width: '20px', height: '20px' }}
                      title="Remove sticky note"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <p style={{ fontSize: '12px', color: '#713F12', marginTop: '6px', lineHeight: '1.4' }}>
                    {node.desc}
                  </p>
                  <span style={{ fontSize: '10px', color: '#A16207', fontStyle: 'italic', marginTop: '8px' }}>
                    Drag anywhere to organize
                  </span>
                </div>
              );
            }

            // 2. DECISION DIAMOND STYLE
            if (node.type === 'decision') {
              return (
                <div
                  key={node.id}
                  className="canvas-node-card"
                  onMouseDown={(e) => handleStartDragNode(e, node)}
                  style={{
                    position: 'absolute',
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: '220px',
                    minHeight: '140px',
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: isSelected ? '2px solid #F56B2C' : '2px solid #FED7AA',
                    boxShadow: isSelected ? '0 14px 34px rgba(245, 107, 44, 0.25)' : '0 6px 18px rgba(0,0,0,0.06)',
                    padding: '16px',
                    cursor: 'grab',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: '800',
                        color: '#EA580C',
                        background: '#FFF7ED',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span style={{ width: '8px', height: '8px', background: '#F56B2C', transform: 'rotate(45deg)' }} />
                      Decision Node
                    </span>
                    <button
                      type="button"
                      className="action-icon-btn delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNode(node.id);
                      }}
                      style={{ width: '22px', height: '22px' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', textAlign: 'center', margin: '4px 0' }}>
                    {node.title}
                  </h4>

                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    {node.desc}
                  </p>

                  {/* Connect arrow button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
                      Status: {node.status}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleStartConnect(e, node.id)}
                      className="btn-secondary"
                      style={{ fontSize: '10px', padding: '3px 8px', height: '24px' }}
                      title="Connect arrow to next node"
                    >
                      <span>Connect ➔</span>
                    </button>
                  </div>

                  {/* Connector target handle */}
                  {connectingFrom && connectingFrom !== node.id && (
                    <div
                      onClick={(e) => handleFinishConnect(e, node.id)}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(245, 107, 44, 0.15)',
                        border: '2px dashed #F56B2C',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#C2410C',
                        fontWeight: '800',
                        fontSize: '12px',
                        cursor: 'pointer',
                        zIndex: 30
                      }}
                    >
                      Connect Here 🎯
                    </div>
                  )}
                </div>
              );
            }

            // 3. PROCESS / TASK WORKFLOW BLOCK
            return (
              <div
                key={node.id}
                className="canvas-node-card"
                onMouseDown={(e) => handleStartDragNode(e, node)}
                style={{
                  position: 'absolute',
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: '260px',
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  borderTop: `4px solid ${node.color || '#3B82F6'}`,
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                  boxShadow: isSelected ? '0 16px 36px rgba(0,0,0,0.15)' : '0 6px 18px rgba(0,0,0,0.06)',
                  padding: '14px 16px',
                  cursor: 'grab',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'box-shadow 0.15s ease'
                }}
              >
                {/* Header Tag & Status Pill */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: '800',
                      color: '#475569',
                      background: '#F1F5F9',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}
                  >
                    {node.tag || 'Deliverable'}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNodeToggleStatus(node);
                    }}
                    style={{
                      border: 'none',
                      background:
                        node.status === 'Done'
                          ? '#DCFCE7'
                          : node.status === 'In Progress'
                          ? '#E0F2FE'
                          : '#FEF3C7',
                      color:
                        node.status === 'Done'
                          ? '#15803D'
                          : node.status === 'In Progress'
                          ? '#0369A1'
                          : '#B45309',
                      fontSize: '10px',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      cursor: 'pointer'
                    }}
                    title="Click to toggle status"
                  >
                    {node.status === 'Done' ? '✓ Delivered' : node.status}
                  </button>
                </div>

                {/* Title */}
                <h4
                  onClick={(e) => {
                    e.stopPropagation();
                    if (node.taskId) {
                      const matched = tasks.find((t) => t.id === node.taskId);
                      if (matched && onSelectTask) onSelectTask(matched);
                    }
                  }}
                  style={{
                    fontSize: '13px',
                    fontWeight: '800',
                    color: node.status === 'Done' ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: node.status === 'Done' ? 'line-through' : 'none',
                    lineHeight: '1.35',
                    cursor: node.taskId ? 'pointer' : 'default'
                  }}
                >
                  {node.title}
                </h4>

                {/* Description Preview */}
                {node.desc && (
                  <p
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.3',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {node.desc}
                  </p>
                )}

                {/* Footer: Assignee & Action Handles */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '4px',
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: '8px'
                  }}
                >
                  {node.team_name ? (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: '800',
                        color: '#0369A1',
                        background: '#E0F2FE',
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}
                    >
                      👥 {node.team_name.split(' ')[0]} Squad
                    </span>
                  ) : assignee ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '5px',
                          backgroundColor: assignee.avatar_color || '#F56B2C',
                          color: '#FFFFFF',
                          fontSize: '9px',
                          fontWeight: '800',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {assignee.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                        {assignee.name.split(' ')[0]}
                      </span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>Unassigned</span>
                  )}

                  {/* Next Step & Connect buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddConnectedStep(node);
                      }}
                      className="action-icon-btn"
                      style={{ width: '22px', height: '22px' }}
                      title="Add connected next step"
                    >
                      <Plus size={13} style={{ color: 'var(--primary)' }} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleStartConnect(e, node.id)}
                      className="action-icon-btn"
                      style={{ width: '22px', height: '22px' }}
                      title="Link arrow to another block"
                    >
                      <ArrowRight size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNode(node.id);
                      }}
                      className="action-icon-btn delete"
                      style={{ width: '22px', height: '22px' }}
                      title="Remove from diagram"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Target overlay when creating a connection */}
                {connectingFrom && connectingFrom !== node.id && (
                  <div
                    onClick={(e) => handleFinishConnect(e, node.id)}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      border: '2px dashed #3B82F6',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1D4ED8',
                      fontWeight: '800',
                      fontSize: '12px',
                      cursor: 'pointer',
                      zIndex: 30
                    }}
                  >
                    Connect Arrow 🎯
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* =========================================================================
            BOTTOM-LEFT STATUS BAR & HELPER TIPS
            ========================================================================= */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: isTrayOpen ? '336px' : '16px',
            zIndex: 25,
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(6px)',
            border: '1px solid var(--border-light)',
            padding: '6px 14px',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            fontSize: '11px',
            fontWeight: '600',
            color: 'var(--text-muted)'
          }}
        >
          <span>🖱️ Click & Drag to move blocks</span>
          <span>•</span>
          <span>🔗 Drag arrow to connect steps</span>
          <span>•</span>
          <span>🔍 Zoom: {Math.round(zoom * 100)}%</span>
          <span>•</span>
          <span>📊 {nodes.length} Blocks, {edges.length} Links</span>
        </div>
      </div>
    </div>
  );
}
