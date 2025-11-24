import React, { useState, useEffect } from 'react';

export default function WarRoom() {
  const [weekData, setWeekData] = useState(() => {
    const saved = localStorage.getItem('w3_warroom');
    return saved ? JSON.parse(saved) : {
      week: 1,
      title: '高效突击周',
      goals: ['完成 Java 集合学习', '刷 20 道算法题', '完成项目 UI'],
      tasks: []
    };
  });

  const [newTask, setNewTask] = useState('');
  const [newGoal, setNewGoal] = useState('');

  // 保存到本地
  useEffect(() => {
    localStorage.setItem('w3_warroom', JSON.stringify(weekData));
  }, [weekData]);

  // 添加任务
  const addTask = () => {
    if (!newTask.trim()) return;
    setWeekData(prev => ({
      ...prev,
      tasks: [...prev.tasks, {
        id: Date.now(),
        title: newTask,
        done: false,
        effort: 5,
        note: ''
      }]
    }));
    setNewTask('');
  };

  // 添加目标
  const addGoal = () => {
    if (!newGoal.trim()) return;
    setWeekData(prev => ({
      ...prev,
      goals: [...prev.goals, newGoal]
    }));
    setNewGoal('');
  };

  // 删除目标
  const deleteGoal = (index) => {
    setWeekData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  // 切换任务状态
  const toggleTask = (id) => {
    setWeekData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === id ? { ...task, done: !task.done } : task
      )
    }));
  };

  // 删除任务
  const deleteTask = (id) => {
    setWeekData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== id)
    }));
  };

  // 更新专注度
  const updateEffort = (id, effort) => {
    setWeekData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === id ? { ...task, effort: parseInt(effort) } : task
      )
    }));
  };

  // 计算完成率
  const completionRate = weekData.tasks.length > 0
    ? Math.round((weekData.tasks.filter(t => t.done).length / weekData.tasks.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* 标题栏 */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl shadow-lg p-8 text-white">
        <input
          type="text"
          value={weekData.title}
          onChange={(e) => setWeekData(prev => ({ ...prev, title: e.target.value }))}
          className="bg-transparent text-3xl font-bold w-full outline-none border-b-2 border-white/30 focus:border-white pb-2"
          placeholder="输入本周标题..."
        />
        <p className="mt-4 text-white/90">第 {weekData.week} 周 · 完成率 {completionRate}%</p>
      </div>

      {/* 本周目标 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-4">🎯 本周目标</h3>
        <div className="space-y-2 mb-4">
          {weekData.goals.map((goal, index) => (
            <div key={index} className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
              <span className="flex-1 text-slate-700">{goal}</span>
              <button
                onClick={() => deleteGoal(index)}
                className="text-red-500 hover:bg-red-50 rounded-lg px-3 py-1 text-sm"
              >
                删除
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addGoal()}
            placeholder="添加新目标..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addGoal}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            添加
          </button>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-4">✅ 任务清单</h3>
        <div className="space-y-3 mb-4">
          {weekData.tasks.map(task => (
            <div key={task.id} className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task.id)}
                  className="w-5 h-5 rounded"
                />
                <span className={`flex-1 ${task.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                  {task.title}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-500 hover:bg-red-50 rounded-lg px-3 py-1 text-sm"
                >
                  删除
                </button>
              </div>
              <div className="flex items-center gap-2 ml-8">
                <label className="text-sm text-slate-600">专注度:</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={task.effort}
                  onChange={(e) => updateEffort(task.id, e.target.value)}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-blue-600 w-8">{task.effort}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            placeholder="添加新任务..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addTask}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            添加
          </button>
        </div>
      </div>
    </div>
  );
}