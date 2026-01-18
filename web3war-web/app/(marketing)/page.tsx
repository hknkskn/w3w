'use client';

import { motion } from 'framer-motion';
import { Shield, Sword, Users, ArrowRight, Zap, Target, Globe, Trophy, Coins, Map } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen relative">

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        {/* Accent Glow Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-500 rounded-full blur-[200px] opacity-10"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[200px] opacity-10"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border-2 border-cyan-400/40 bg-cyan-400/10 text-cyan-300 text-sm font-bold uppercase tracking-widest mb-8 shadow-lg shadow-cyan-500/20">
              <Zap size={16} fill="currentColor" /> Live on Supra Network
            </div>

            {/* Main Title */}
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-6">
              <span className="text-white drop-shadow-2xl">WEB3</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-2xl">WAR</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-3xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed mb-4">
              Conquer territories, build your empire, dominate the blockchain.
            </p>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              The first <span className="text-cyan-400 font-semibold">fully on-chain</span> grand strategy MMO where every action is permanent and every asset is yours.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-4"
          >
            <button
              onClick={() => router.push('/dashboard')}
              className="group relative px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-bold rounded-xl overflow-hidden shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center gap-3">
                <Shield size={24} /> Launch Game
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <button className="px-10 py-5 border-2 border-slate-600 text-slate-300 text-lg font-bold rounded-xl hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300">
              View Whitepaper
            </button>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 mt-16 border-t border-slate-700/50"
          >
            <StatBox label="Active Players" value="12,405" icon={<Users size={24} />} />
            <StatBox label="Battles Today" value="8,932" icon={<Sword size={24} />} />
            <StatBox label="TVL Locked" value="$4.2M" icon={<Coins size={24} />} />
            <StatBox label="Territories" value="193" icon={<Map size={24} />} />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative z-10 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              Strategic Warfare, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Evolved</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Every decision matters. Every battle is recorded on-chain. Your legacy is permanent.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Globe size={48} className="text-cyan-400" />}
              title="Global Domination"
              desc="Fight for control over real-world territories. Conquer regions to extract resources and expand your empire across the globe."
              delay={0.1}
            />
            <FeatureCard
              icon={<Sword size={48} className="text-blue-400" />}
              title="Strategic Combat"
              desc="Pure skill-based warfare. Your tactics, unit composition, and timing determine victory. No randomness, just strategy."
              delay={0.2}
            />
            <FeatureCard
              icon={<Trophy size={48} className="text-purple-400" />}
              title="True Ownership"
              desc="Every asset is an NFT. Trade weapons, resources, and territories on the open marketplace. Your wins are your wealth."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border-2 border-cyan-500/30 rounded-3xl p-16 shadow-2xl shadow-cyan-500/20"
        >
          <h3 className="text-5xl font-black text-white mb-6">
            Ready to Conquer?
          </h3>
          <p className="text-xl text-slate-300 mb-10">
            Join thousands of commanders building their legacy on the blockchain.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-12 py-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xl font-bold rounded-xl shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-500/60 hover:scale-105 transition-all duration-300"
          >
            Start Your Campaign →
          </button>
        </motion.div>
      </section>
    </main>
  );
}

function StatBox({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center space-y-2 p-6 rounded-xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-sm">
      <div className="text-cyan-400 mb-2">{icon}</div>
      <span className="text-4xl font-black text-white">{value}</span>
      <span className="text-sm text-slate-400 uppercase tracking-wider font-semibold">{label}</span>
    </div>
  )
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      className="group relative p-8 rounded-2xl bg-slate-800/40 border-2 border-slate-700/50 hover:border-cyan-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-800/60"
    >
      <div className="w-20 h-20 rounded-2xl bg-slate-900/50 border border-slate-700 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-cyan-500/50 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-cyan-400 transition-colors">
        {title}
      </h3>
      <p className="text-slate-400 leading-relaxed text-lg">
        {desc}
      </p>
    </motion.div>
  )
}
