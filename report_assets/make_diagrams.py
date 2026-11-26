import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Ellipse, Rectangle

OUT = r'C:\Users\HP\Desktop\Devconnect\report_assets\figures'
BOX = dict(boxstyle='round,pad=0.35', fc='#eef2f7', ec='#333333', lw=1.4)
TITLE = dict(fontsize=15, fontweight='bold', family='DejaVu Serif')

def save(fig, name):
    fig.savefig(OUT + '\\' + name, dpi=160, bbox_inches='tight', facecolor='white')
    plt.close(fig)
    print('wrote', name)

# ---------------- ER Diagram ----------------
fig, ax = plt.subplots(figsize=(13.5, 8.2))
ax.set_xlim(0, 100); ax.set_ylim(0, 56); ax.axis('off')
ax.text(50, 54.6, 'DevConnect Entity-Relationship Diagram (PostgreSQL / Prisma)', ha='center', **TITLE)

ents = {
 'User':          (40, 26, ['id (PK)', 'role', 'email (unique)', 'skills[]', 'visibility']),
 'Company':       (10, 44, ['id (PK)', 'name', 'industry']),
 'Job':           (40, 44, ['id (PK)', 'title', 'status', 'required_skills[]']),
 'Application':   (68, 44, ['id (PK)', 'status', 'cover_note', 'unique(job,user)']),
 'AppEvent':      (88, 44, ['id (PK)', 'status', 'by', 'note']),
 'Connection':    (10, 6,  ['id (PK)', 'state', 'message']),
 'Repository':    (34, 6,  ['id (PK)', 'name', 'stars', 'language']),
 'Project':       (56, 6,  ['id (PK)', 'title', 'tags[]']),
 'Notification':  (78, 6,  ['id (PK)', 'kind', 'read']),
 'ActivityEvent': (92, 26, ['id (PK)', 'kind', 'target_id']),
}
centers = {}
BW = 15
for name, (cx, cy, cols) in ents.items():
    h = 4.6 + 2.2 * len(cols)
    x, y = cx - BW / 2, cy - h / 2
    ax.add_patch(Rectangle((x, y), BW, h, fc='#f7f9fc', ec='#333', lw=1.5))
    ax.text(cx, y + h - 1.5, name, ha='center', fontsize=10.5, fontweight='bold')
    for i, c in enumerate(cols):
        ax.text(x + 0.6, y + h - 3.8 - i * 2.2, c, fontsize=7.8, family='monospace')
    centers[name] = (cx, cy, h)

def edge(a, b, label, ax_off=0, ay_off=0, bx_off=0, by_off=0):
    acx, acy, ah = centers[a]; bcx, bcy, bh = centers[b]
    p1 = (acx + ax_off, acy + (ah / 2 if ay_off > 0 else (-ah / 2 if ay_off < 0 else 0)))
    p2 = (bcx + bx_off, bcy + (bh / 2 if by_off > 0 else (-bh / 2 if by_off < 0 else 0)))
    if ay_off == 0 and by_off == 0:
        p1 = (acx + (BW / 2 if bcx > acx else -BW / 2), acy)
        p2 = (bcx + (BW / 2 if bcx < acx else -BW / 2), bcy)
    ax.add_patch(FancyArrowPatch(p1, p2, arrowstyle='-', lw=1.2, color='#444'))
    mx, my = (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2
    ax.text(mx, my, label, ha='center', fontsize=7.6, style='italic', color='#111',
            bbox=dict(boxstyle='round,pad=0.15', fc='white', ec='none', alpha=0.9))

edge('Company', 'Job', '1 : N has')
edge('Job', 'Application', '1 : N receives')
edge('Application', 'AppEvent', '1 : N logs')
edge('User', 'Job', '1 : N posts', ay_off=1, by_off=-1)
edge('User', 'Application', '1 : N submits', ax_off=3, ay_off=1)
edge('User', 'Company', 'N : 1 works at', ax_off=-3, ay_off=1)
edge('User', 'Connection', '1 : N connects', ax_off=-5, ay_off=-1)
edge('User', 'Repository', '1 : N imports', ax_off=-1.5, ay_off=-1)
edge('User', 'Project', '1 : N features', ax_off=1.5, ay_off=-1)
edge('User', 'Notification', '1 : N receives', ax_off=4, ay_off=-1)
edge('User', 'ActivityEvent', '1 : N generates')
ax.text(50, 0.6, 'Join tables SavedJob(user_id, job_id) and SavedCandidate(user_id, developer_id) and PasswordResetToken are documented in Appendix A.', ha='center', fontsize=8.5, style='italic')
save(fig, 'er_diagram.png')

# ---------------- Class / Component Diagram ----------------
fig, ax = plt.subplots(figsize=(13, 7.6))
ax.set_xlim(0, 100); ax.set_ylim(0, 60); ax.axis('off')
ax.text(50, 58.6, 'DevConnect Component & Class Overview (Frontend / API / Data layers)', ha='center', **TITLE)

def cls(x, y, w, name, attrs, methods):
    h = 4 + 2.6 * (len(attrs) + len(methods))
    ax.add_patch(Rectangle((x, y), w, h, fc='white', ec='#333', lw=1.5))
    ax.text(x + w / 2, y + h - 2, name, ha='center', fontsize=10, fontweight='bold')
    yy = y + h - 4.4
    for a in attrs:
        ax.text(x + 0.7, yy, a, fontsize=7.8, family='monospace'); yy -= 2.6
    yy -= 0.6
    for m in methods:
        ax.text(x + 0.7, yy, m, fontsize=7.8, family='monospace'); yy -= 2.6
    return (x, y, w, h)

c1 = cls(2, 34, 21, 'App (React)', ['routes: RouteObject[]'], ['AuthProvider()', 'RoleGate(allow)', 'ProtectedRoute()'])
c2 = cls(26, 34, 22, 'Pages (23 screens)', ['Dashboard, Jobs, Matches', 'Network, Repositories', 'Recruiter* screens'], ['useStore()', 'api facade'])
c3 = cls(52, 34, 21, 'store.js (cache)', ['users, jobs, applications', 'connections, notifications'], ['hydrate(snapshot)', 'applyPatch(patch)'])
c4 = cls(77, 34, 21, 'matching.js', ['MATCH_WEIGHTS 60/15/15/10'], ['scoreJob(profile, job)', 'band(score)'])
c5 = cls(2, 12, 21, 'Express app.js', ['routers: /api/v1/*', 'CORS + cookie-parser'], ['route(fn)', 'errorHandler()'])
c6 = cls(26, 12, 22, 'auth.js', ['JWT_SECRET, HttpOnly cookie'], ['requireAuth()', 'requireCapability(role)'])
c7 = cls(52, 12, 21, 'routes/*.js', ['auth, discovery, network', 'applications, recruiter'], ['parse(zod, body)', 'ApiError(code)'])
c8 = cls(77, 12, 21, 'Prisma Client', ['12 models, 2 migrations'], ['db.job.findMany()', 'db.$transaction()'])

def link(x1, y1, x2, y2, label=''):
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), arrowstyle='-|>', lw=1.3, color='#333'))
    if label:
        ax.text((x1 + x2) / 2, (y1 + y2) / 2 + 0.8, label, ha='center', fontsize=7.5, style='italic')

link(13, 34, 13, 26.6, 'fetch /api/v1')
link(37, 34, 37, 26.6)
link(62, 34, 62, 26.6)
link(87, 34, 87, 26.6)
link(23, 45, 26, 45, 'imports')
link(48, 45, 52, 45, 'reads')
link(73, 45, 77, 45, 'scores')
link(23, 18, 26, 18, 'uses')
link(48, 18, 52, 18, 'mounts')
link(73, 18, 77, 18, 'queries')
ax.text(50, 4.2, 'Shared domain rules (src/lib) are re-exported by the server (server/src/domain.js) so scoring and permissions behave identically on both sides.', ha='center', fontsize=9, style='italic')
save(fig, 'class_diagram.png')

# ---------------- Activity Diagram ----------------
fig, ax = plt.subplots(figsize=(12, 8.2))
ax.set_xlim(0, 100); ax.set_ylim(0, 72); ax.axis('off')
ax.text(50, 70.6, 'Activity Diagram — Developer Job Search & Application Flow', ha='center', **TITLE)

def act(x, y, w, label, kind='act'):
    if kind == 'act':
        ax.add_patch(FancyBboxPatch((x, y), w, 4.6, boxstyle='round,pad=0.3,rounding_size=1.2', fc='#eef2f7', ec='#333333', lw=1.4))
    elif kind == 'dec':
        pts = [(x + w / 2, y + 5.6), (x + w, y + 2.8), (x + w / 2, y), (x, y + 2.8)]
        ax.add_patch(plt.Polygon(pts, closed=True, fc='#fdf3d7', ec='#333', lw=1.4))
    else:
        ax.add_patch(Rectangle((x, y), w, 1.6, fc='#333', ec='#333'))
    if kind != 'bar':
        ax.text(x + w / 2, y + (2.3 if kind == 'act' else 2.8), label, ha='center', va='center', fontsize=8.6)

start = (8, 62); 
ax.add_patch(plt.Circle((start[0] + 2, start[1] + 2), 1.6, fc='#333'))
act(22, 62, 20, 'Login / open dashboard')
act(48, 62, 20, 'Browse job board')
act(74, 62, 20, 'Apply filters & search')
act(22, 52, 20, 'Open job details')
act(48, 52, 24, 'View match score & reasons')
act(78, 52, 18, 'Save job')
act(22, 41, 22, 'Fill application form')
act(52, 41, 18, 'Cover note >= 40 chars?', 'dec')
act(76, 41, 20, 'Show validation error')
act(30, 30, 24, 'Submit application (POST apply)')
act(58, 30, 20, 'Duplicate check', 'dec')
act(82, 30, 16, '409 already applied')
act(20, 19, 24, 'Application + event created')
act(50, 19, 22, 'Recruiter notified')
act(8, 8, 22, 'Track status in Applications')
act(36, 8, 24, 'Recruiter moves stage / interview')
act(66, 8, 22, 'Developer notified & timeline')
ax.add_patch(plt.Circle((95, 9.6), 1.6, fc='#333', ec='white', lw=1.5))
ax.add_patch(plt.Circle((95, 9.6), 0.8, fc='#333'))

def ar(x1, y1, x2, y2):
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), arrowstyle='-|>', lw=1.3, color='#333'))

ar(9.6, 64, 22, 64.3)
ar(42, 64.3, 48, 64.3)
ar(68, 64.3, 74, 64.3)
ar(84, 62, 32, 56.8)
ar(42, 54.3, 48, 54.3)
ar(68, 54.3, 78, 54.3)
ar(33, 52, 33, 45.8)
ar(44, 43.3, 52, 43.3)
ar(70, 43.3, 76, 43.3)
ax.text(71, 45, 'no', fontsize=8, style='italic')
ax.text(46.5, 45, 'yes', fontsize=8, style='italic')
ar(61, 41, 42, 34.8)
ar(54, 32.3, 58, 32.3)
ar(78, 32.3, 82, 32.3)
ax.text(76, 34, 'no', fontsize=8, style='italic')
ax.text(56, 35.5, 'yes', fontsize=8, style='italic')
ar(68, 30, 32, 23.8)
ar(44, 21.3, 50, 21.3)
ar(72, 21.3, 77, 12.6)
ar(32, 19, 19, 12.8)
ar(30, 10.3, 36, 10.3)
ar(60, 10.3, 66, 10.3)
ar(88, 10.3, 93.4, 10)
save(fig, 'activity_diagram.png')
