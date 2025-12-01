import React, { useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Heading, 
  Quote, 
  Code, 
  Link, 
  List, 
  Image,
  Eye,
  EyeOff
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownEditor({ value, onChange, showPreview = true }) {
  const textareaRef = useRef(null);
  const [previewMode, setPreviewMode] = React.useState(showPreview);

  // 插入格式的通用函数
  const insertFormat = (before, after = '', placeholder = '文本') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || placeholder;
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // 重新聚焦并选中插入的内容
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  // 工具栏按钮
  const toolbarButtons = [
    {
      icon: <Bold size={18} />,
      label: '加粗',
      action: () => insertFormat('**', '**', '加粗文字'),
    },
    {
      icon: <Italic size={18} />,
      label: '斜体',
      action: () => insertFormat('*', '*', '斜体文字'),
    },
    {
      icon: <Heading size={18} />,
      label: '标题',
      action: () => {
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const newText = value.substring(0, lineStart) + '## ' + value.substring(lineStart);
        onChange(newText);
        setTimeout(() => textarea.focus(), 0);
      },
    },
    {
      icon: <Quote size={18} />,
      label: '引用',
      action: () => {
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const newText = value.substring(0, lineStart) + '> ' + value.substring(lineStart);
        onChange(newText);
        setTimeout(() => textarea.focus(), 0);
      },
    },
    {
      icon: <Code size={18} />,
      label: '代码',
      action: () => insertFormat('`', '`', '代码'),
    },
    {
      icon: <Link size={18} />,
      label: '链接',
      action: () => insertFormat('[', '](https://example.com)', '链接文字'),
    },
    {
      icon: <List size={18} />,
      label: '列表',
      action: () => {
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const newText = value.substring(0, lineStart) + '- ' + value.substring(lineStart);
        onChange(newText);
        setTimeout(() => textarea.focus(), 0);
      },
    },
    {
      icon: <Image size={18} />,
      label: '图片',
      action: () => insertFormat('![', '](https://example.com/image.jpg)', '图片描述'),
    },
  ];

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="bg-slate-50 border border-slate-300 rounded-lg p-2 flex items-center gap-2 flex-wrap">
        {toolbarButtons.map((button, index) => (
          <button
            key={index}
            onClick={button.action}
            className="p-2 hover:bg-white rounded transition-colors text-slate-700 hover:text-blue-600"
            title={button.label}
          >
            {button.icon}
          </button>
        ))}
        
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-100 rounded transition-colors text-sm"
          >
            {previewMode ? (
              <>
                <EyeOff size={16} />
                隐藏预览
              </>
            ) : (
              <>
                <Eye size={16} />
                显示预览
              </>
            )}
          </button>
        </div>
      </div>

      {/* 编辑器 */}
      <div className={`grid ${previewMode ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
        {/* Markdown 输入框 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Markdown 编辑器
          </label>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="# 标题

这里开始写作...

**加粗文字** *斜体文字*

- 列表项 1
- 列表项 2

> 引用内容

`代码`

[链接](https://example.com)"
            className="w-full h-96 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
          />
          <p className="text-xs text-slate-500 mt-2">
            💡 支持 Markdown 语法，使用工具栏快速插入格式
          </p>
        </div>

        {/* 实时预览 */}
        {previewMode && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              实时预览
            </label>
            <div className="w-full h-96 px-4 py-3 border border-slate-300 rounded-lg bg-white overflow-y-auto">
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {value || '*预览区域*'}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}