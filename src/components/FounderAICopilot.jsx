import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Bot,
  Send,
  X,
  Maximize2,
  Minimize2,
  Trash2,
  Workflow,
  PlusCircle,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Layers,
  Zap,
  Key,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { askFounderAI, getGeminiApiKey, setGeminiApiKey } from '../lib/gemini';
import { formatIndianDate } from '../lib/supabase';

// Helper to render markdown-like formatting in messages
function formatMarkdown(text) {
  if (!text) return null;

  // Split into lines
  const lines = text.split('\n');

  return lines.map((line, idx) => {
    // Empty line
    if (!line.trim()) {
      return <div key={idx} style={{ height: '8px' }} />;
    }

    // Heading 3 / ###
    if (line.startsWith('### ')) {
      return (
        <h4
          key={idx}
          style={{
            fontSize: '14px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            margin: '10px 0 4px 0'
          }}
        >
          {line.replace('### ', '')}
        </h4>
      );
    }

    // Bullet point
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const content = line.trim().substring(2);
      return (
        <div
          key={idx}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            margin: '4px 0',
            fontSize: '13px',
            lineHeight: '1.5'
          }}
        >
          <span style={{ color: '#F56B2C', fontWeight: 'bold' }}>•</span>
          <div>{renderInlineFormatting(content)}</div>
        </div>
      );
    }

    // Regular line
    return (
      <p
        key={idx}
        style={{
          margin: '4px 0',
          fontSize: '13px',
          lineHeight: '1.5',
          color: 'var(--text-primary)'
        }}
      >
        {renderInlineFormatting(line)}
      </p>
    );
  });
}

function renderInlineFormatting(text) {
  // Simple bold and code replacement
  const parts = [];
  let remaining = text;
  let keyIndex = 0;

  // Regex for **bold** or `code`
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let match;
  let lastIdx = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.substring(lastIdx, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={keyIndex++} style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
          {token.substring(2, token.length - 2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={keyIndex++}
          style={{
            padding: '2px 5px',
            backgroundColor: '#F3F4F6',
            borderRadius: '4px',
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#D97706'
          }}
        >
          {token.substring(1, token.length - 1)}
        </code>
      );
    }
    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) {
    parts.push(text.substring(lastIdx));
  }

  return parts.length > 0 ? parts : text;
}

export default function FounderAICopilot({
  isOpen,
  onClose,
  tasks = [],
  employees = [],
  teams = [],
  currentUser = {},
  onAssignTask,
  onOpenTaskModalWithData,
  onNavigateToCanvas,
  showToast
}) {
  const [messages, setMessages] = useState(() => {
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `Namaste Founder! 🙏 I am your **TaskFlow AI Executive Copilot** powered by **Gemini Pro**.

I have real-time visibility into all **${tasks.length} deliverables**, **${employees.length} team members**, and squads for **Acme Infotech India**.

Here is what I can do for you right now:
- 💡 **Strategic Insights**: Ask *"Which tasks are overdue or at risk?"* or *"Analyze team workload balance"*
- ⚡ **Natural Language Task Assignment**: Say *"Assign Rohan to fix Razorpay webhook retries by tomorrow, high priority"*
- 🎨 **AI Project Canvas Generator**: Say *"Generate a workflow canvas flowchart for our Quick Commerce MVP"* or *"Design flowchart for GST cycle"*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState(() => getGeminiApiKey());
  const [actionStates, setActionStates] = useState({}); // track created tasks / applied canvases

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isLoading]);

  // Quick prompt chips
  const quickPrompts = [
    {
      label: '⚡ Overdue Audit',
      query: 'Analyze which tasks are currently overdue or at critical risk, and recommend immediate next steps.'
    },
    {
      label: '🎯 Assign GST Task to Priya',
      query: 'Assign a high-priority task to Priya Sharma: Reconcile supplier GSTR-2B invoices and audit ITC mismatch before Friday 5 PM.'
    },
    {
      label: '🎨 Quick Commerce Canvas',
      query: 'Generate a workflow canvas flowchart for our 10-minute Quick Commerce delivery MVP with order, inventory, dispatch and delivery nodes.'
    },
    {
      label: '📊 Team Workload Balance',
      query: 'Audit the current workload of all team members. Who has too many pending tasks, and who has bandwidth to take on new projects?'
    },
    {
      label: '🛍️ Festive Sale Canvas',
      query: 'Generate a workflow canvas flowchart for our Diwali Festive Sale marketing and inventory fulfillment funnel.'
    }
  ];

  const handleSendMessage = async (userText) => {
    const query = userText || inputValue;
    if (!query || !query.trim() || isLoading) return;

    const userMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await askFounderAI({
        query: query.trim(),
        conversationHistory: messages,
        context: {
          tasks,
          employees,
          teams,
          currentUser
        }
      });

      const assistantMessage = {
        id: 'msg-' + (Date.now() + 1),
        role: 'assistant',
        content: response.reply,
        action: response.action,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Founder AI Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg-' + (Date.now() + 1),
          role: 'assistant',
          content: `⚠️ **Unable to complete request**: ${err.message}. Please check your Gemini API key or try again in a moment.`,
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Approve and Create Task via AI
  const handleApproveTask = async (msgId, taskData) => {
    if (!taskData || actionStates[`task_${msgId}`]) return;

    try {
      // Find matching employee or fallback
      let assigneeId = taskData.assignee_id;
      if (!assigneeId && taskData.assignee_name) {
        const found = employees.find((e) =>
          e.name.toLowerCase().includes(taskData.assignee_name.toLowerCase())
        );
        if (found) assigneeId = found.id;
      }

      const newTask = {
        title: taskData.title || 'New AI Task',
        description: taskData.description || 'Generated by Founder AI Copilot',
        assignee_id: assigneeId || (employees[0] ? employees[0].id : 'emp-1'),
        priority: taskData.priority || 'High',
        status: 'Pending',
        deadline: taskData.deadline || new Date(Date.now() + 86400000 * 2).toISOString(),
        tags: Array.isArray(taskData.tags) ? taskData.tags.join(', ') : taskData.tags || 'AI Created'
      };

      if (onAssignTask) {
        await onAssignTask(newTask);
      }

      setActionStates((prev) => ({ ...prev, [`task_${msgId}`]: true }));
      confetti({ particleCount: 50, spread: 60 });
      if (showToast) {
        showToast(`✅ Task "${newTask.title}" added to pipeline!`);
      }
    } catch (e) {
      console.error('Failed to create task:', e);
      if (showToast) {
        showToast('❌ Failed to create task');
      }
    }
  };

  // Handler: Apply AI Canvas Flowchart
  const handleApplyCanvas = (msgId, canvasData) => {
    if (!canvasData || !canvasData.nodes) return;

    try {
      // Store in localStorage for TaskFlowCanvas
      localStorage.setItem(
        'taskflow_canvas_state_v2',
        JSON.stringify({
          nodes: canvasData.nodes,
          edges: canvasData.edges || [],
          updated_at: new Date().toISOString()
        })
      );

      // Dispatch real-time event to TaskFlowCanvas
      window.dispatchEvent(
        new CustomEvent('taskflow_load_ai_canvas', {
          detail: {
            nodes: canvasData.nodes,
            edges: canvasData.edges || []
          }
        })
      );

      setActionStates((prev) => ({ ...prev, [`canvas_${msgId}`]: true }));
      confetti({ particleCount: 70, spread: 75 });

      if (showToast) {
        showToast(`🎨 Loaded "${canvasData.title || 'AI Project Canvas'}" into Workflow Canvas!`);
      }

      // Navigate to canvas view
      if (onNavigateToCanvas) {
        setTimeout(() => {
          onNavigateToCanvas();
          if (onClose) onClose();
        }, 500);
      }
    } catch (e) {
      console.error('Failed to load AI canvas:', e);
    }
  };

  // Handler: Also create canvas nodes as backlog tasks
  const handleSyncCanvasNodesAsTasks = async (msgId, canvasData) => {
    if (!canvasData?.nodes || actionStates[`sync_${msgId}`]) return;

    try {
      for (const node of canvasData.nodes) {
        const newTask = {
          title: node.title,
          description: node.desc || `Part of ${canvasData.title || 'Project Flowchart'}`,
          priority: node.priority || 'Medium',
          status: node.status || 'Pending',
          assignee_id: node.assignee_id || (employees[0] ? employees[0].id : 'emp-1'),
          tags: node.tag || 'AI Flowchart',
          deadline: new Date(Date.now() + 86400000 * 4).toISOString()
        };
        if (onAssignTask) {
          await onAssignTask(newTask);
        }
      }
      setActionStates((prev) => ({ ...prev, [`sync_${msgId}`]: true }));
      confetti({ particleCount: 50, spread: 60 });
      if (showToast) {
        showToast(`🚀 Created ${canvasData.nodes.length} backlog tasks from flowchart!`);
      }
    } catch (e) {
      console.error('Sync nodes failed:', e);
    }
  };

  const handleSaveApiKey = () => {
    setGeminiApiKey(customKeyInput);
    setShowKeyConfig(false);
    if (showToast) {
      showToast('🔑 Gemini API Key updated successfully');
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `Namaste Founder! 🙏 Chat history cleared. How can I assist you with your operations today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`founder-ai-overlay ${isExpanded ? 'expanded' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="founder-ai-modal"
        style={{
          width: isExpanded ? '94vw' : '720px',
          maxWidth: '100%',
          height: isExpanded ? '92vh' : '650px',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #E5E7EB',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1E293B'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #F56B2C 0%, #EA580C 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                boxShadow: '0 4px 12px rgba(245, 107, 44, 0.4)'
              }}
            >
              <Bot size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: '#FFFFFF' }}>
                  TaskFlow AI Founder Copilot
                </h3>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 7px',
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    color: '#4ADE80',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#22C55E'
                    }}
                  />
                  Gemini 2.5 Flash
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8' }}>
                Executive Intelligence & Auto-Task Assignment for Acme Infotech India
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setShowKeyConfig(!showKeyConfig)}
              title="Configure Gemini API Key"
              style={{
                background: 'transparent',
                border: 'none',
                color: showKeyConfig ? '#F56B2C' : '#94A3B8',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px'
              }}
            >
              <Key size={16} />
            </button>
            <button
              onClick={handleClearChat}
              title="Clear chat history"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px'
              }}
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Restore' : 'Maximize'}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px'
              }}
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              onClick={onClose}
              title="Close Copilot"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Optional: API Key Configuration Tray */}
        {showKeyConfig && (
          <div
            style={{
              padding: '12px 20px',
              backgroundColor: '#FEF3C7',
              borderBottom: '1px solid #FDE68A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              fontSize: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <Key size={15} style={{ color: '#D97706' }} />
              <span style={{ fontWeight: '600', color: '#92400E' }}>Gemini API Key:</span>
              <input
                type="password"
                value={customKeyInput}
                onChange={(e) => setCustomKeyInput(e.target.value)}
                placeholder="Enter Gemini API key"
                style={{
                  flex: 1,
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: '1px solid #FCD34D',
                  fontSize: '12px',
                  fontFamily: 'monospace'
                }}
              />
            </div>
            <button
              onClick={handleSaveApiKey}
              style={{
                padding: '5px 12px',
                backgroundColor: '#D97706',
                color: '#FFF',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '12px'
              }}
            >
              Save Key
            </button>
          </div>
        )}

        {/* Real-time Context Banner */}
        <div
          style={{
            padding: '8px 20px',
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: '#64748B'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <span>
              🏢 <strong>Acme Infotech India</strong>
            </span>
            <span>
              📋 <strong>{tasks.length}</strong> Tasks Backlog
            </span>
            <span>
              👥 <strong>{employees.length}</strong> Team Members
            </span>
            <span>
              ⚠️ Overdue:{' '}
              <strong style={{ color: '#EF4444' }}>
                {tasks.filter((t) => t.status !== 'Done' && new Date(t.deadline) < new Date()).length}
              </strong>
            </span>
          </div>
          <span style={{ color: '#F56B2C', fontWeight: '600' }}>Live IST Context</span>
        </div>

        {/* Message Stream */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            backgroundColor: '#FAFAFA'
          }}
        >
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '100%'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    maxWidth: isUser ? '85%' : '90%'
                  }}
                >
                  {!isUser && (
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '8px',
                        backgroundColor: '#0F172A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#F56B2C',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                    >
                      <Sparkles size={16} />
                    </div>
                  )}

                  <div
                    style={{
                      backgroundColor: isUser ? '#F56B2C' : '#FFFFFF',
                      color: isUser ? '#FFFFFF' : 'var(--text-primary)',
                      padding: '12px 16px',
                      borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      boxShadow: isUser
                        ? '0 4px 12px rgba(245, 107, 44, 0.2)'
                        : '0 2px 8px rgba(0, 0, 0, 0.05)',
                      border: isUser ? 'none' : '1px solid #E5E7EB',
                      fontSize: '13px',
                      lineHeight: '1.5'
                    }}
                  >
                    {isUser ? (
                      <p style={{ margin: 0 }}>{msg.content}</p>
                    ) : (
                      <div>{formatMarkdown(msg.content)}</div>
                    )}

                    {/* ACTION CARD 1: TASK ASSIGNMENT */}
                    {msg.action?.type === 'CREATE_TASK' && msg.action.task && (
                      <div
                        style={{
                          marginTop: '12px',
                          padding: '12px 14px',
                          backgroundColor: '#FFFBEB',
                          border: '1px solid #FDE68A',
                          borderRadius: '12px',
                          boxShadow: '0 2px 6px rgba(245, 158, 11, 0.08)'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '8px'
                          }}
                        >
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: '700',
                              color: '#92400E',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Zap size={13} style={{ color: '#D97706' }} />
                            AI Task Proposal
                          </span>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '20px',
                              fontSize: '10px',
                              fontWeight: '700',
                              backgroundColor:
                                msg.action.task.priority === 'Urgent'
                                  ? '#FEE2E2'
                                  : msg.action.task.priority === 'High'
                                  ? '#FFEDD5'
                                  : '#E0E7FF',
                              color:
                                msg.action.task.priority === 'Urgent'
                                  ? '#DC2626'
                                  : msg.action.task.priority === 'High'
                                  ? '#C2410C'
                                  : '#4338CA'
                            }}
                          >
                            {msg.action.task.priority} Priority
                          </span>
                        </div>

                        <h4
                          style={{
                            fontSize: '14px',
                            fontWeight: '800',
                            color: '#1E293B',
                            margin: '0 0 6px 0'
                          }}
                        >
                          {msg.action.task.title}
                        </h4>

                        <p
                          style={{
                            fontSize: '12px',
                            color: '#475569',
                            margin: '0 0 10px 0',
                            lineHeight: '1.4'
                          }}
                        >
                          {msg.action.task.description}
                        </p>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            fontSize: '11px',
                            color: '#64748B',
                            marginBottom: '12px',
                            flexWrap: 'wrap'
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <User size={13} />
                            Assignee:{' '}
                            <strong style={{ color: '#0F172A' }}>
                              {msg.action.task.assignee_name ||
                                employees.find((e) => e.id === msg.action.task.assignee_id)?.name ||
                                'Team Member'}
                            </strong>
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={13} />
                            Due:{' '}
                            <strong style={{ color: '#0F172A' }}>
                              {formatIndianDate(msg.action.task.deadline)}
                            </strong>
                          </span>
                        </div>

                        {actionStates[`task_${msg.id}`] ? (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              backgroundColor: '#DCFCE7',
                              color: '#166534',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '700'
                            }}
                          >
                            <CheckCircle2 size={15} />
                            Task Created & Assigned to Pipeline!
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => handleApproveTask(msg.id, msg.action.task)}
                              style={{
                                padding: '7px 14px',
                                backgroundColor: '#F56B2C',
                                color: '#FFF',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 2px 6px rgba(245, 107, 44, 0.3)'
                              }}
                            >
                              <PlusCircle size={14} />
                              Approve & Create Task
                            </button>
                            <button
                              onClick={() => {
                                if (onOpenTaskModalWithData) {
                                  onOpenTaskModalWithData(msg.action.task);
                                }
                              }}
                              style={{
                                padding: '7px 12px',
                                backgroundColor: '#FFF',
                                color: '#475569',
                                border: '1px solid #CBD5E1',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              Edit in Modal
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ACTION CARD 2: GENERATED CANVAS / FLOWCHART */}
                    {msg.action?.type === 'GENERATE_CANVAS' && msg.action.canvas && (
                      <div
                        style={{
                          marginTop: '12px',
                          padding: '14px',
                          backgroundColor: '#F0FDF4',
                          border: '1px solid #BBF7D0',
                          borderRadius: '12px',
                          boxShadow: '0 2px 6px rgba(16, 185, 129, 0.08)'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '8px'
                          }}
                        >
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: '700',
                              color: '#166534',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Workflow size={13} style={{ color: '#10B981' }} />
                            AI Generated Flowchart Canvas
                          </span>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '20px',
                              fontSize: '10px',
                              fontWeight: '700',
                              backgroundColor: '#DCFCE7',
                              color: '#15803D'
                            }}
                          >
                            {msg.action.canvas.nodes?.length || 0} Nodes ·{' '}
                            {msg.action.canvas.edges?.length || 0} Links
                          </span>
                        </div>

                        <h4
                          style={{
                            fontSize: '14px',
                            fontWeight: '800',
                            color: '#0F172A',
                            margin: '0 0 4px 0'
                          }}
                        >
                          {msg.action.canvas.title || 'Project Architecture Flowchart'}
                        </h4>

                        <p
                          style={{
                            fontSize: '12px',
                            color: '#475569',
                            margin: '0 0 10px 0',
                            lineHeight: '1.4'
                          }}
                        >
                          {msg.action.canvas.description}
                        </p>

                        {/* Interactive Mini-Flow Preview */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            overflowX: 'auto',
                            padding: '8px 4px',
                            marginBottom: '12px',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '8px',
                            border: '1px solid #DCFCE7'
                          }}
                        >
                          {msg.action.canvas.nodes?.map((node, nIdx) => (
                            <React.Fragment key={node.id || nIdx}>
                              <div
                                style={{
                                  padding: '5px 9px',
                                  backgroundColor: node.color ? `${node.color}15` : '#EFF6FF',
                                  border: `1px solid ${node.color || '#3B82F6'}`,
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  color: node.color || '#1E40AF',
                                  whiteSpace: 'nowrap',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                {node.type === 'milestone' ? '🚩' : node.type === 'decision' ? '🔷' : '⚙️'}
                                {node.title}
                              </div>
                              {nIdx < (msg.action.canvas.nodes.length - 1) && (
                                <ArrowRight size={13} style={{ color: '#94A3B8', flexShrink: 0 }} />
                              )}
                            </React.Fragment>
                          ))}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleApplyCanvas(msg.id, msg.action.canvas)}
                            style={{
                              padding: '7px 14px',
                              backgroundColor: '#10B981',
                              color: '#FFF',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
                            }}
                          >
                            <ExternalLink size={14} />
                            Open in Workflow Canvas
                          </button>

                          <button
                            onClick={() => handleSyncCanvasNodesAsTasks(msg.id, msg.action.canvas)}
                            disabled={actionStates[`sync_${msg.id}`]}
                            style={{
                              padding: '7px 12px',
                              backgroundColor: actionStates[`sync_${msg.id}`] ? '#E2E8F0' : '#FFFFFF',
                              color: actionStates[`sync_${msg.id}`] ? '#94A3B8' : '#334155',
                              border: '1px solid #CBD5E1',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: actionStates[`sync_${msg.id}`] ? 'default' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Layers size={13} />
                            {actionStates[`sync_${msg.id}`]
                              ? '✓ Backlog Tasks Created'
                              : 'Add Nodes to Backlog'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '10px',
                    color: '#94A3B8',
                    marginTop: '3px',
                    marginRight: isUser ? '4px' : '0',
                    marginLeft: isUser ? '0' : '40px'
                  }}
                >
                  {msg.timestamp}
                </span>
              </div>
            );
          })}

          {/* Thinking / Loading Indicator */}
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  backgroundColor: '#0F172A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F56B2C'
                }}
              >
                <Sparkles size={16} className="spin-slow" />
              </div>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '12px 18px',
                  borderRadius: '16px 16px 16px 4px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div className="dot-pulse" />
                <span style={{ fontSize: '13px', color: '#64748B' }}>
                  Gemini AI is analyzing operations & drafting proposal...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8' }}>Quick:</span>
          {quickPrompts.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip.query)}
              disabled={isLoading}
              style={{
                padding: '4px 10px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                fontSize: '11px',
                fontWeight: '600',
                color: '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FFF7ED';
                e.currentTarget.style.borderColor = '#FDBA74';
                e.currentTarget.style.color = '#C2410C';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.color = '#475569';
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask about tasks, assign to an employee, or request a flowchart canvas..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #D1D5DB',
              fontSize: '13px',
              outline: 'none',
              transition: 'border-color 0.2s',
              color: '#0F172A'
            }}
            onFocus={(e) => (e.target.style.borderColor = '#F56B2C')}
            onBlur={(e) => (e.target.style.borderColor = '#D1D5DB')}
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: !inputValue.trim() || isLoading ? '#E2E8F0' : '#F56B2C',
              color: !inputValue.trim() || isLoading ? '#94A3B8' : '#FFFFFF',
              border: 'none',
              cursor: !inputValue.trim() || isLoading ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow:
                !inputValue.trim() || isLoading ? 'none' : '0 4px 10px rgba(245, 107, 44, 0.3)'
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
