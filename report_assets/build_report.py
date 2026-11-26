# -*- coding: utf-8 -*-
"""Builds the DevConnect final project report (.docx) per MIT Meerut format."""
import os
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from PIL import Image

ROOT = r'C:\Users\HP\Desktop\Devconnect'
FIG = os.path.join(ROOT, 'report_assets', 'figures')
SHOTS = os.path.join(ROOT, 'report_assets', 'screenshots')
OUT = os.path.join(ROOT, 'DevConnect_Project_Report.docx')

TNR = 'Times New Roman'
doc = Document()

# ---------- base styles ----------
def set_style_font(style, size, bold=False, color=RGBColor(0, 0, 0)):
    style.font.name = TNR
    style.font.size = Pt(size)
    style.font.bold = bold
    style.font.color.rgb = color
    rpr = style.element.get_or_add_rPr()
    rf = rpr.find(qn('w:rFonts'))
    if rf is None:
        rf = OxmlElement('w:rFonts'); rpr.append(rf)
    for a in ('w:ascii', 'w:hAnsi', 'w:cs'):
        rf.set(qn(a), TNR)

normal = doc.styles['Normal']
set_style_font(normal, 12)
normal.paragraph_format.line_spacing = 1.5
normal.paragraph_format.space_after = Pt(2)
normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

h1 = doc.styles['Heading 1']
set_style_font(h1, 16, bold=True)
h1.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
h1.paragraph_format.page_break_before = True
h1.paragraph_format.space_before = Pt(0)
h1.paragraph_format.space_after = Pt(14)
h1.paragraph_format.line_spacing = 1.5

h2 = doc.styles['Heading 2']
set_style_font(h2, 14, bold=True)
h2.paragraph_format.space_before = Pt(10)
h2.paragraph_format.space_after = Pt(6)
h2.paragraph_format.line_spacing = 1.5

h3 = doc.styles['Heading 3']
set_style_font(h3, 12, bold=True)
h3.paragraph_format.space_before = Pt(8)
h3.paragraph_format.space_after = Pt(4)
h3.paragraph_format.line_spacing = 1.5

# ---------- helpers ----------
def P(text='', align=None, size=12, bold=False, italic=False, space_after=None, style=None):
    p = doc.add_paragraph(style=style)
    if text:
        r = p.add_run(text)
        r.font.name = TNR; r.font.size = Pt(size); r.bold = bold; r.italic = italic
    if align is not None:
        p.alignment = align
    if space_after is not None:
        p.paragraph_format.space_after = Pt(space_after)
    return p

def C(text, size=12, bold=True, space_after=6):
    return P(text, align=WD_ALIGN_PARAGRAPH.CENTER, size=size, bold=bold, space_after=space_after)

def set_margins(section):
    section.page_width = Inches(8.27)
    section.page_height = Inches(11.69)
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1.5)
    section.right_margin = Inches(1)

def set_pgnum(section, fmt, start):
    sectPr = section._sectPr
    pg = sectPr.find(qn('w:pgNumType'))
    if pg is None:
        pg = OxmlElement('w:pgNumType')
        sectPr.append(pg)
    pg.set(qn('w:fmt'), fmt)
    pg.set(qn('w:start'), str(start))

def footer_pagenum(section):
    section.footer.is_linked_to_previous = False
    fp = section.footer.paragraphs[0]
    fp.text = ''
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    def fld(t):
        e = OxmlElement('w:fldChar'); e.set(qn('w:fldCharType'), t); return e
    instr = OxmlElement('w:instrText'); instr.set(qn('xml:space'), 'preserve'); instr.text = 'PAGE'
    r1 = fp.add_run(); r1._r.append(fld('begin'))
    r2 = fp.add_run(); r2._r.append(instr)
    r3 = fp.add_run(); r3._r.append(fld('end'))
    for r in (r1, r2, r3):
        r.font.name = TNR; r.font.size = Pt(12)

def add_figure(img_path, label, max_w=5.6, max_h=6.4):
    with Image.open(img_path) as im:
        w, h = im.size
    ratio = h / w
    if ratio > max_h / max_w:
        kw = {'height': Inches(max_h)}
    else:
        kw = {'width': Inches(max_w)}
    doc.add_picture(img_path, **kw)
    doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
    P(label, align=WD_ALIGN_PARAGRAPH.CENTER, size=12, space_after=10)

def add_table(rows, header=True, widths=None, font_size=11):
    t = doc.add_table(rows=len(rows), cols=len(rows[0]))
    t.style = 'Table Grid'
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, row in enumerate(rows):
        for j, val in enumerate(row):
            cell = t.cell(i, j)
            cell.text = ''
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(str(val))
            r.font.name = TNR; r.font.size = Pt(font_size)
            if header and i == 0:
                r.bold = True
    if widths:
        for j, w in enumerate(widths):
            for row in t.rows:
                row.cells[j].width = Inches(w)
    P('', space_after=8)
    return t

def table_caption(text):
    P(text, align=WD_ALIGN_PARAGRAPH.CENTER, size=12, bold=False, space_after=4)

def bullet(text, style='List Bullet'):
    p = doc.add_paragraph(style=style)
    r = p.add_run(text)
    r.font.name = TNR; r.font.size = Pt(12)
    return p

# ================= SECTION 1: TITLE PAGE =================
s0 = doc.sections[0]
set_margins(s0)
s0.footer.is_linked_to_previous = False  # empty footer, no page number

C('MEERUT INSTITUTE OF TECHNOLOGY, MEERUT', size=16, space_after=2)
C('DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING', size=14, space_after=10)
p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run(); r.add_picture(os.path.join(FIG, 'image1.jpeg'), height=Inches(1.4))
P('', space_after=10)
C('DEVCONNECT', size=20, space_after=2)
C('A Full-Stack Developer Professional Networking and Recruitment Platform with '
  'GitHub Integration and AI-Based Job Matching', size=14, space_after=14)
C('A PROJECT REPORT', size=13, space_after=2)
C('Submitted in partial fulfillment of the requirements for the award of the degree of', size=12, bold=False, space_after=2)
C('BACHELOR OF TECHNOLOGY', size=14, space_after=2)
C('in', size=12, bold=False, space_after=2)
C('COMPUTER SCIENCE & ENGINEERING', size=14, space_after=12)
for line in ['Sagar Kumar (University Roll No.: 2302920100126)',
             'Prince Kumar (University Roll No.: 2302920100105)',
             'Rupam Bhardwaj (University Roll No.: 2302920100125)',
             'Prashant Kumar (University Roll No.: 2302920100104)',
             'Vansh Chauhan (University Roll No.: 2302920100155)']:
    C(line, size=12, bold=False, space_after=2)
P('', space_after=6)
C('Under the Supervision of', size=12, bold=False, space_after=2)
C('Ms. Neelam Yadav', size=13, space_after=2)
C('Assistant Professor, Department of Computer Science & Engineering', size=12, bold=False, space_after=12)
C('DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING', size=13, space_after=2)
C('MEERUT INSTITUTE OF TECHNOLOGY, MEERUT', size=14, space_after=6)
C('Affiliated to', size=12, bold=False, space_after=2)
C('DR. A.P.J. ABDUL KALAM TECHNICAL UNIVERSITY, UTTAR PRADESH, LUCKNOW', size=13, space_after=6)
C('November, 2026', size=13, space_after=2)

# ================= SECTION 2: FRONT MATTER (roman) =================
s1 = doc.add_section(WD_SECTION.NEW_PAGE)
set_margins(s1)
set_pgnum(s1, 'lowerRoman', 1)
footer_pagenum(s1)

# ---- Certificate ----
C('CERTIFICATE', size=16, space_after=16)
P('I hereby declare that the work which is being presented in the project report entitled '
  '"DevConnect: A Full-Stack Developer Professional Networking and Recruitment Platform with GitHub '
  'Integration and AI-Based Job Matching", in partial fulfillment of the requirements for the award of '
  'the degree of Bachelor of Technology in Computer Science and Engineering of Meerut Institute of '
  'Technology, Meerut, is an authentic record of our own work carried out under the supervision of '
  'Ms. Neelam Yadav and refers to other researchers\u2019 works which are duly listed in the reference '
  'section.')
P('The matter presented in this project has not been submitted for the award of any other degree of '
  'this or any other university.')
P('', space_after=14)
P('Date: ....................', space_after=2)
P('Place: ....................', space_after=16)
P('Signature: ______________________     Sagar Kumar (2302920100126)', space_after=2)
P('Signature: ______________________     Prince Kumar (2302920100105)', space_after=2)
P('Signature: ______________________     Rupam Bhardwaj (2302920100125)', space_after=2)
P('Signature: ______________________     Prashant Kumar (2302920100104)', space_after=2)
P('Signature: ______________________     Vansh Chauhan (2302920100155)', space_after=16)
P('This is to certify that the above statement made by the candidates is correct and true to the best '
  'of my knowledge.')
P('', space_after=24)
P('Signature: ______________________     Ms. Neelam Yadav', space_after=2)
P('Assistant Professor, Meerut Institute of Technology, Meerut.', space_after=16)
C('Countersigned by', size=12, space_after=10)
tbl = doc.add_table(rows=2, cols=2)
tbl.cell(0, 0).text = '(Name of Project Coordinator)\nAssistant Professor\nMeerut Institute of Technology, Meerut'
tbl.cell(0, 1).text = '(Name of HOD)\nHOD \u2013 Computer Science & Engineering\nMeerut Institute of Technology, Meerut'
for row in tbl.rows:
    for c in row.cells:
        for pp in c.paragraphs:
            pp.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for rr in pp.runs:
                rr.font.name = TNR; rr.font.size = Pt(12)

# ---- Acknowledgement ----
doc.add_page_break()
C('ACKNOWLEDGEMENT', size=16, space_after=16)
P('It gives us a great sense of pleasure to present the report of the B.Tech project entitled '
  '"DevConnect" undertaken during our B.Tech programme. We owe a special debt of gratitude to '
  'Ms. Neelam Yadav and the designated project coordinator, Department of Computer Science & Engineering, '
  'Meerut Institute of Technology, Meerut, for their constant support and guidance throughout the course '
  'of this work. Their sincerity, thoroughness and perseverance have been a constant source of inspiration '
  'for us. It is only due to their cognizant efforts that our endeavors have seen the light of the day.')
P('We also take this opportunity to acknowledge the contribution of the Head of the Department of '
  'Computer Science & Engineering, Meerut Institute of Technology, Meerut, for full support and assistance '
  'during the development of the project.')
P('We do not like to miss the opportunity to acknowledge all project coordinators and faculty members of '
  'the department for their kind assistance and cooperation during the development of our project. Last but '
  'not the least, we acknowledge our friends for their contribution in the completion of the project.')
P('', space_after=10)
P('Sagar Kumar (2302920100126)        Prince Kumar (2302920100105)', space_after=2)
P('Rupam Bhardwaj (2302920100125)     Prashant Kumar (2302920100104)', space_after=2)
P('Vansh Chauhan (2302920100155)', space_after=2)

# ---- Abstract ----
doc.add_page_break()
C('ABSTRACT', size=16, space_after=14)
P('Professional networking and recruitment for software developers are today spread across disconnected '
  'tools: social professional profiles, code-hosting platforms, job boards and application trackers. A '
  'developer\u2019s resume rarely communicates practical evidence such as repository activity and project '
  'work, while recruiters struggle to connect job requirements with verifiable skills and to explain why a '
  'candidate is relevant. This project presents DevConnect, a responsive full-stack web application that '
  'unifies developer profiles, consent-based GitHub integration, professional networking, community '
  'activity, complete recruitment workflows and explainable AI-assisted job matching in a single '
  'role-aware platform.')
P('The system is implemented as a React 19 single-page client built with Vite and Tailwind CSS, a '
  'versioned Node.js/Express 5 REST API secured with JWT session cookies, bcrypt password hashing and '
  'Zod request validation, and a PostgreSQL database managed through twelve Prisma models with '
  'reproducible migrations. Job matching uses a transparent deterministic scoring baseline with weights '
  'of 60, 15, 15 and 10 percent over required skills, preferred skills, experience level and work mode, '
  'producing human-readable match reasons; an optional LLM service is never a prerequisite for core '
  'matching. Role-based access control separates developer, recruiter and administrator capabilities, and '
  'ownership rules protect every record.')
P('The platform was verified through a 123-check HTTP API test suite and documented manual test cases '
  'covering authentication, authorization, duplicate-application handling, GitHub import failure paths, '
  'match explanation faithfulness and responsive layouts. The delivered system realises all stated '
  'objectives: a runnable full-stack application with persisted profiles, connections, job postings, '
  'applications with stage timelines, notifications and explainable recommendations, demonstrating '
  'responsible, auditable design for AI-assisted recruitment.')
P('', space_after=8)
P('Keywords: Full-Stack Web Application, Professional Networking, Recruitment, GitHub API, Explainable '
  'Job Matching, REST API, PostgreSQL, Role-Based Access Control.', size=12, italic=True)

# ---- Table of Contents (field) ----
doc.add_page_break()
C('TABLE OF CONTENTS', size=16, space_after=14)
p = doc.add_paragraph()
r = p.add_run()
e = OxmlElement('w:fldChar'); e.set(qn('w:fldCharType'), 'begin'); r._r.append(e)
r2 = p.add_run()
instr = OxmlElement('w:instrText'); instr.set(qn('xml:space'), 'preserve')
instr.text = r'TOC \o "1-2" \h \z \u'
r2._r.append(instr)
r3 = p.add_run()
e2 = OxmlElement('w:fldChar'); e2.set(qn('w:fldCharType'), 'separate'); r3._r.append(e2)
r4 = p.add_run('Right-click here in Microsoft Word and choose "Update Field" to build the table of contents.')
r4.font.name = TNR; r4.font.size = Pt(12); r4.italic = True
r5 = p.add_run()
e3 = OxmlElement('w:fldChar'); e3.set(qn('w:fldCharType'), 'end'); r5._r.append(e3)

# ---- List of Figures ----
doc.add_page_break()
C('LIST OF FIGURES', size=16, space_after=12)
for line in [
 'Figure 4.1: Primary Actor-to-Use-Case View',
 'Figure 4.2: Data Flow Diagram \u2014 Level 0',
 'Figure 4.3: Data Flow Diagram \u2014 Level 1',
 'Figure 4.4: DevConnect Logical System Architecture',
 'Figure 4.5: Component & Class Overview Diagram',
 'Figure 4.6: Activity Diagram \u2014 Job Search and Application Flow',
 'Figure 4.7: Entity-Relationship Diagram',
 'Figure 5.1: Landing Page',
 'Figure 5.2: Sign-In Screen with Demo Accounts',
 'Figure 5.3: Registration Screen',
 'Figure 5.4: Developer Dashboard',
 'Figure 5.5: Job Board with Facet Filters',
 'Figure 5.6: Explainable Matches Screen',
 'Figure 5.7: Job Details Page',
 'Figure 5.8: Job Application Form',
 'Figure 5.9: My Applications List',
 'Figure 5.10: Application Detail with Stage Timeline',
 'Figure 5.11: Saved Jobs Shortlist',
 'Figure 5.12: Network \u2014 Directory, Requests and Connections',
 'Figure 5.13: GitHub Repository Insights',
 'Figure 5.14: Developer Profile View',
 'Figure 5.15: Settings Screen',
 'Figure 5.16: Recruiter Overview Dashboard',
 'Figure 5.17: Recruiter Job Postings Manager',
 'Figure 5.18: Applicant Pipeline with Match Scores',
 'Figure A.1: Profile Editor',
 'Figure A.2: Notification Inbox',
 'Figure A.3: Create Job Posting Form',
 'Figure A.4: Saved Candidates Shortlist',
 'Figure A.5: Candidate Profile (Recruiter View)',
]:
    P(line, space_after=3)

# ---- List of Tables ----
C('', space_after=10)
C('LIST OF TABLES', size=16, space_after=12)
for line in [
 'Table 2.1: Literature Comparison and Critical Gap Analysis',
 'Table 3.1: Existing System versus Proposed System',
 'Table 5.1: Tools and Technologies Used',
 'Table 5.2: REST API Endpoint Summary',
 'Table 5.3: Test Cases and Results',
 'Table A.1 \u2013 A.12: Database Table Structures',
]:
    P(line, space_after=3)

# ---- List of Abbreviations ----
doc.add_page_break()
C('LIST OF ABBREVIATIONS', size=16, space_after=12)
add_table([
 ['Abbreviation', 'Full Form'],
 ['API', 'Application Programming Interface'],
 ['AKTU', 'Dr. A.P.J. Abdul Kalam Technical University'],
 ['CORS', 'Cross-Origin Resource Sharing'],
 ['DFD', 'Data Flow Diagram'],
 ['ER', 'Entity-Relationship'],
 ['HTTP(S)', 'HyperText Transfer Protocol (Secure)'],
 ['JWT', 'JSON Web Token'],
 ['LLM', 'Large Language Model'],
 ['ORM', 'Object-Relational Mapping'],
 ['REST', 'Representational State Transfer'],
 ['SQL', 'Structured Query Language'],
 ['UI/UX', 'User Interface / User Experience'],
], widths=[1.6, 4.0])
