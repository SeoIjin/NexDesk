# NexDesk

**A Web-Based IT Help Desk and Ticketing System for Technician Assignment and Resolution Tracking**

## School Project Notice

NexDesk is a school project developed and owned by **SBIT - 2D GROUP 4**, **IS Project Management IS 106** (School Year **2026-2027**), **Quezon City University**.

The included users, tickets, technicians, assets, inventory, SLA records, and other sample data are mocked for demonstration and coursework. Do not use this project to store real personal, financial, or business information.

## About

NexDesk is a role-based IT help desk dashboard for Employees, Technicians, Team Leads, and IT Managers. Employees report computer problems, the system assigns the best-suited technician, every ticket moves through a defined workflow, and resolution times are tracked against SLAs. Managers get real-time visibility into workload, risk, and service quality.

It is built as a React and TypeScript frontend with a Node.js (NestJS) API that connects to MySQL. The frontend does not connect directly to the database. Database access and authentication are handled by the API.

### Key Features

- **Ticket reporting:** guided form, auto-priority scoring (P1 to P4), and duplicate detection
- **Smart assignment:** technicians scored on skills, workload, shift, location, and past performance, with explainable recommendations
- **Ticket workflow:** New → Triaged → Assigned → In Progress → Pending → Resolved → Verified/Closed → Reopened
- **SLA monitoring:** live timers, pause logic for Pending tickets, and predictive breach alerts
- **Risk management:** at-risk tickets, overloaded technicians, recurring problem hotspots, and a risk register
- **Quality assurance:** mandatory resolution notes, CSAT surveys, QA review queue, and technician scorecards
- **Audit and access control:** full change history and role-based permissions

### Innovations

- **Smart Dispatch:** recommends the best technician and explains why (for example, "92% skill match, 3 open tickets, same building"), so assignments are transparent and easy to override.
- **Predictive SLA Breach Alerts:** warns the team before a deadline is missed, not after, so tickets can be reassigned or escalated in time.
- **QR-Code Asset Scanning:** employees and technicians scan a device's QR code on mobile to automatically fill in the asset details.
- **Major Incident Mode:** a banner and bulk-notification tool for outages (for example, a VPN outage affecting 120 users), with related tickets grouped under one parent incident.
- **Gamification:** badges, streaks, and a leaderboard for technicians, weighted by quality (CSAT, reopen rate, QA score) and not just speed.
- **Real-Time Collaboration:** several technicians can work on one ticket together, with live presence indicators.

## Technology

- React, TypeScript, and Vite
- Tailwind CSS
- Node.js with NestJS (REST API and WebSockets)
- MySQL 8 with Prisma or TypeORM
- Redis for caching, SLA timers, and job queues
