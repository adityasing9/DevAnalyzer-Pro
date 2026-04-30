import React from 'react';

const Landing = () => {
  return (
    <div className="relative min-h-screen bg-[#0a0f14] flex flex-col items-center justify-between py-20 px-6 font-['Inter',sans-serif] overflow-hidden">
      {/* Background Gradient / Mesh */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-[#1a2b33] to-[#0a0f14] opacity-80" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center flex-grow">
        {/* Main Title */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-[#00ffcc] tracking-tight mb-4 drop-shadow-[0_0_15px_rgba(0,255,204,0.4)]">
<<<<<<< HEAD
          Developer Skill Analyzer Pro
=======
          Smart Resource Allocation
>>>>>>> origin/main
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl font-medium text-[#00ccaa] opacity-90 tracking-wide">
<<<<<<< HEAD
          AI-powered GitHub Profile Auditor
        </p>
      </div>


=======
          AI-powered Volunteer Matching Platform
        </p>
      </div>

      {/* AI-Inspire Label */}
      <div className="relative z-10 text-[#00ffcc] font-mono text-xl tracking-[0.2em] mb-12">
        AI-Inspire
      </div>
>>>>>>> origin/main

      {/* Curved SVG Divider - Very Subtle and Dark */}
      <div className="absolute bottom-0 left-0 w-full leading-[0] z-0">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-40 fill-[#0c151a]">
          <path d="M0,224L120,213.3C240,203,480,181,720,181.3C960,181,1200,203,1320,213.3L1440,224L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default Landing;
<<<<<<< HEAD

=======
>>>>>>> origin/main
