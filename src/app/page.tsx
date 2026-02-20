"use client";
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Octokit } from "octokit";
import { 
  Download, Github as GithubIcon, Moon, Sun, Terminal, 
  Loader2, Cpu, Zap, Layers, Code2, CheckCircle2, Save, ExternalLink
} from 'lucide-react';

const THEMES = {
  modern: { 
    wrapper: "bg-slate-50 text-slate-900", 
    prose: "prose-slate", 
    card: "bg-white border-slate-200 shadow-indigo-100", 
    accent: "text-indigo-700", 
    btn: "bg-indigo-600 hover:bg-indigo-700", 
    syntax: prism,
    footerName: "text-indigo-900" 
  },
  dark: { 
    wrapper: "bg-slate-950 text-slate-100", 
    prose: "prose-invert prose-blue", 
    card: "bg-slate-900 border-slate-800", 
    accent: "text-blue-400", 
    btn: "bg-blue-600 hover:bg-blue-500", 
    syntax: vscDarkPlus,
    footerName: "text-blue-400" 
  },
  terminal: { 
    wrapper: "bg-black text-green-400 font-mono", 
    prose: "prose-invert prose-green font-mono", 
    card: "bg-black border-green-900 shadow-green-900/10", 
    accent: "text-green-500", 
    btn: "bg-green-900 hover:bg-green-800 border border-green-500", 
    syntax: vscDarkPlus,
    footerName: "text-green-400" 
  }
};

export default function EchoCompiler() {
  const myName = "B Sharana Basava"; 
  const aiPartner = "Gemini AI";

  const [markdown, setMarkdown] = useState("");
  const [debouncedMarkdown, setDebouncedMarkdown] = useState("");
  const [currentTheme, setCurrentTheme] = useState<keyof typeof THEMES>('modern');
  const [isDeploying, setIsDeploying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('echo-content');
    if (saved) { 
      setMarkdown(saved); 
      setDebouncedMarkdown(saved); 
    } else { 
      setMarkdown("# 🚀 ECHO Compiler Active\n\nWelcome, **" + myName + "**. Start building your portfolio."); 
    }
  }, []);

  useEffect(() => {
    setIsSaving(true);
    const handler = setTimeout(() => {
      setDebouncedMarkdown(markdown);
      localStorage.setItem('echo-content', markdown);
      setIsSaving(false);
    }, 450);
    return () => clearTimeout(handler);
  }, [markdown]);

  const generateHTMLWrapper = () => {
    const content = document.getElementById('preview-content')?.innerHTML;
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Portfolio | ${myName}</title><script src="https://cdn.tailwindcss.com?plugins=typography"></script></head><body class="${THEMES[currentTheme].wrapper} p-8 md:p-16"><article class="prose ${THEMES[currentTheme].prose} mx-auto max-w-4xl">${content}</article></body></html>`;
  };

  const downloadAsHTML = () => {
    const blob = new Blob([generateHTMLWrapper()], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'echo_portfolio.html'; a.click();
  };

  const deployToGithub = async () => {
    const token = prompt("Enter GitHub Token:");
    if (!token) return;
    setIsDeploying(true);
    const octokit = new Octokit({ auth: token });
    const repoName = "echo-portfolio-site";
    try {
      const { data: user } = await octokit.rest.users.getAuthenticated();
      try { await octokit.rest.repos.createForAuthenticatedUser({ name: repoName, auto_init: true }); await new Promise(r => setTimeout(r, 2000)); } catch (e) {}
      let sha; try { const { data }: any = await octokit.rest.repos.getContent({ owner: user.login, repo: repoName, path: "index.html" }); sha = data.sha; } catch (e) {}
      await octokit.rest.repos.createOrUpdateFileContents({ owner: user.login, repo: repoName, path: "index.html", message: "ECHO Build Sync", content: btoa(unescape(encodeURIComponent(generateHTMLWrapper()))), sha: sha });
      alert(`🚀 Successfully Deployed!`);
    } catch (error: any) { alert(`Error: ${error.message}`); } finally { setIsDeploying(false); }
  };

  return (
    <div className={`flex flex-col h-screen transition-all duration-500 ${THEMES[currentTheme].wrapper}`}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code&display=swap');
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.2); border-radius: 10px; }
        .font-mono-echo { font-family: 'Fira Code', monospace !important; }
      `}</style>

      <header className="flex flex-col sm:flex-row items-center justify-between px-6 py-3 border-b border-slate-500/10 backdrop-blur-md z-50 gap-4">
        <div className="flex items-center gap-3">
          <div className={`${THEMES[currentTheme].btn} p-2 rounded-xl text-white shadow-lg`}><Layers size={20} /></div>
          <div>
            <h1 className="text-lg font-black tracking-tighter uppercase italic">ECHO Compiler</h1>
            <div className="flex items-center gap-2">
              {isSaving ? <span className="text-[9px] text-orange-400 animate-pulse font-bold tracking-widest">● SYNCING</span> : <span className="text-[9px] text-green-500 font-bold uppercase tracking-widest">● LOCAL_SAVED</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <nav className="flex bg-slate-500/10 p-1 rounded-xl border border-slate-500/10">
            {(['modern', 'dark', 'terminal'] as const).map((t) => (
              <button key={t} onClick={() => setCurrentTheme(t)} className={`p-2 rounded-lg transition ${currentTheme === t ? 'bg-white text-indigo-600 shadow-md' : 'opacity-40 hover:opacity-100'}`}>
                {t === 'modern' && <Sun size={16}/>}
                {t === 'dark' && <Moon size={16}/>}
                {t === 'terminal' && <Terminal size={16}/>}
              </button>
            ))}
          </nav>
          <button onClick={downloadAsHTML} className="px-4 py-2 border border-slate-500/20 rounded-xl text-[10px] font-black uppercase hover:bg-white/10 transition flex items-center gap-2"><Download size={12}/> Export</button>
          <button onClick={deployToGithub} disabled={isDeploying} className={`flex items-center gap-2 px-5 py-2 text-white rounded-xl shadow-lg transition-all disabled:opacity-50 text-[10px] font-black uppercase ${THEMES[currentTheme].btn}`}>
            {isDeploying ? <Loader2 className="animate-spin" size={14} /> : <GithubIcon size={14} />}
            {isDeploying ? "Pushing..." : "Live Push"}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 gap-4">
        <section className={`flex-1 flex flex-col rounded-3xl border transition-all duration-300 shadow-xl overflow-hidden ${THEMES[currentTheme].card}`}>
          <div className="px-5 py-2 border-b border-slate-500/10 bg-slate-500/5 flex justify-between">
            <span className="text-[9px] font-bold uppercase tracking-widest opacity-50 flex items-center gap-2"><Code2 size={12}/> Input_Buffer</span>
            <span className="text-[8px] font-mono opacity-30">CHAR_COUNT: {markdown.length}</span>
          </div>
          <textarea className="flex-1 p-6 outline-none resize-none font-mono-echo text-sm leading-relaxed bg-transparent custom-scrollbar" value={markdown} onChange={(e) => setMarkdown(e.target.value)} spellCheck="false" />
        </section>

        <section className={`flex-1 flex flex-col rounded-3xl border transition-all duration-500 shadow-2xl overflow-hidden ${THEMES[currentTheme].card}`}>
          <div className="px-5 py-2 border-b border-slate-500/10 bg-slate-500/5">
            <span className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 ${THEMES[currentTheme].accent}`}><Zap size={12}/> Output_Render</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
            <div id="preview-content" className={`prose ${THEMES[currentTheme].prose} max-w-none`}>
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  // FIXED: Removed 'inline' and added check for 'language-' match
                  code({node, className, children, ...props}: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isCodeBlock = !!match;
                    
                    return isCodeBlock ? (
                      <SyntaxHighlighter 
                        style={THEMES[currentTheme].syntax as any} 
                        language={match[1]} 
                        PreTag="div" 
                        className="rounded-2xl !my-6 shadow-2xl border border-white/5" 
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : ( 
                      <code className={`${className} bg-slate-500/10 px-1.5 py-0.5 rounded text-sm`} {...props}>
                        {children}
                      </code> 
                    );
                  }
                }}
              >
                {debouncedMarkdown}
              </ReactMarkdown>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-8 py-4 border-t border-slate-500/10 flex flex-col md:flex-row items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] gap-4">
        <div className="flex items-center gap-4 opacity-30">
          <span className="flex items-center gap-1.5"><Cpu size={12}/> v2.1</span>
          <span className="h-1 w-1 rounded-full bg-current"></span>
          <span>STABLE_BUILD</span>
        </div>
        <div className="flex items-center bg-slate-500/5 px-4 py-1.5 rounded-full border border-slate-500/10 backdrop-blur-sm">
          <span className="opacity-40 text-[8px] mr-3">Architecture:</span>
          <span className="font-black opacity-80 tracking-widest">{myName.toUpperCase()}</span> 
          <span className="mx-2 opacity-20 font-light">x</span> 
          <span className="font-medium opacity-60 tracking-tighter">{aiPartner}</span>
        </div>
        <div className="opacity-20 tracking-[0.4em] text-[8px]">2026 © ECHO_SYSTEM</div>
      </footer>
    </div>
  );
}
