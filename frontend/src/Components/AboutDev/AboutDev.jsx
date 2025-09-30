import React from 'react';
import { Github, Linkedin, Mail, Code, Database, Server, Globe, Users, BookOpen, Award } from 'lucide-react';
import styles from './AboutDev.module.css';

const AboutDev = () => {
  const developers = [
    {
      name: 'Pawan Fuke',
      role: 'Full Stack Developer',
      skills: ['React', 'Node.js', 'Spring Boot', 'MySQL'],
      github: 'https://github.com/pawanfuke',
      linkedin: 'https://linkedin.com/in/pawanfuke',
      email: 'pawan.fuke@email.com'
    },
    {
      name: 'Mayur Darji',
      role: 'Backend Developer',
      skills: ['Spring Boot', 'Java', 'MySQL', 'REST APIs'],
      github: 'https://github.com/mayurdarji',
      linkedin: 'https://linkedin.com/in/mayurdarji',
      email: 'mayur.darji@email.com'
    },
    {
      name: 'Omkar Deshpande',
      role: 'Frontend Developer',
      skills: ['React', 'JavaScript', 'CSS', 'UI/UX'],
      github: 'https://github.com/omkardeshpande',
      linkedin: 'https://linkedin.com/in/omkardeshpande',
      email: 'omkar.deshpande@email.com'
    }
  ];

  const techStack = [
    {
      category: 'Frontend',
      technologies: [
        { name: 'React 19', description: 'Modern UI library' },
        { name: 'Vite', description: 'Fast build tool' },
        { name: 'CSS Modules', description: 'Scoped styling' },
        { name: 'Lucide React', description: 'Icon library' }
      ],
      icon: <Globe size={24} />
    },
    {
      category: 'Backend',
      technologies: [
        { name: 'Spring Boot', description: 'Java framework' },
        { name: 'Maven', description: 'Dependency management' },
        { name: 'REST APIs', description: 'Web services' },
        { name: 'JWT', description: 'Authentication' }
      ],
      icon: <Server size={24} />
    },
    {
      category: 'Database',
      technologies: [
        { name: 'MySQL', description: 'Relational database' },
        { name: 'JPA/Hibernate', description: 'ORM framework' },
        { name: 'Database Design', description: 'Schema optimization' }
      ],
      icon: <Database size={24} />
    }
  ];

  const features = [
    {
      title: 'User Management',
      description: 'Complete user authentication and role-based access control',
      icon: <Users size={20} />
    },
    {
      title: 'Book Management',
      description: 'Add, edit, delete, and search books with advanced filtering',
      icon: <BookOpen size={20} />
    },
    {
      title: 'Responsive Design',
      description: 'Mobile-first design that works on all devices',
      icon: <Globe size={20} />
    },
    {
      title: 'Modern UI/UXfont',
      description: 'Clean, intuitive interface with smooth animations',
      icon: <Award size={20} />
    }
  ];

  return (
    <div className={styles.aboutContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>About the Project</h1>
        <p className={styles.subtitle}>
          A modern library management system built with cutting-edge technologies
        </p>
      </div>

      {/* Project Overview */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Project Overview</h2>
        <div className={styles.overview}>
          <div className={styles.overviewContent}>
            <p className={styles.description}>
              This Library Management System is a comprehensive web application designed to
              streamline library operations. It provides an intuitive interface for managing
              books, users, and borrowing operations while maintaining a modern, responsive design.
            </p>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>3</span>
                <span className={styles.statLabel}>Developers</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>10+</span>
                <span className={styles.statLabel}>Technologies</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>100%</span>
                <span className={styles.statLabel}>Responsive</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Key Features</h2>
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                {feature.icon}
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Technology Stack</h2>
        <div className={styles.techStack}>
          {techStack.map((stack, index) => (
            <div key={index} className={styles.techCategory}>
              <div className={styles.techHeader}>
                <div className={styles.techIcon}>
                  {stack.icon}
                </div>
                <h3 className={styles.techTitle}>{stack.category}</h3>
              </div>
              <div className={styles.techList}>
                {stack.technologies.map((tech, techIndex) => (
                  <div key={techIndex} className={styles.techItem}>
                    <span className={styles.techName}>{tech.name}</span>
                    <span className={styles.techDescription}>{tech.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Developers */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Meet the Team</h2>
        <div className={styles.developersGrid}>
          {developers.map((dev, index) => (
            <div key={index} className={styles.developerCard}>
              <div className={styles.developerAvatar}>
                {dev.name.charAt(0)}
              </div>
              <div className={styles.developerInfo}>
                <h3 className={styles.developerName}>{dev.name}</h3>
                <p className={styles.developerRole}>{dev.role}</p>
                <div className={styles.developerSkills}>
                  {dev.skills.map((skill, skillIndex) => (
                    <span key={skillIndex} className={styles.skillTag}>
                      {skill}
                    </span>
                  ))}
                </div>
                <div className={styles.developerLinks}>
                  <a
                    href={dev.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    title="GitHub"
                  >
                    <Github size={18} />
                  </a>
                  <a
                    href={dev.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    title="LinkedIn"
                  >
                    <Linkedin size={18} />
                  </a>
                  <a
                    href={`mailto:${dev.email}`}
                    className={styles.socialLink}
                    title="Email"
                  >
                    <Mail size={18} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Info */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Project Information</h2>
        <div className={styles.projectInfo}>
          <div className={styles.infoCard}>
            <Code size={24} className={styles.infoIcon} />
            <div className={styles.infoContent}>
              <h4>Frontend Repository</h4>
              <p>React-based user interface with modern design patterns</p>
              <a href="https://github.com/PawanTheCoder/LMS/tree/main/frontend" className={styles.infoLink}>View on GitHub</a>
            </div>
          </div>
          <div className={styles.infoCard}>
            <Server size={24} className={styles.infoIcon} />
            <div className={styles.infoContent}>
              <h4>Backend Repository</h4>
              <p>Spring Boot REST API with MySQL database</p>
              <a href="https://github.com/PawanTheCoder/LMS/tree/main/backend" className={styles.infoLink}>View on GitHub</a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p className={styles.footerText}>
          Built with ❤️ by the development team • 2025
        </p>
      </div>
    </div>
  );
};

export default AboutDev;
