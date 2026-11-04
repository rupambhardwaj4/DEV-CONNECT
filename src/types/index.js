/**
 * Core entity contracts for the DevConnect mock data layer.
 *
 * These are JSDoc typedefs (not a TypeScript migration): every mock record, store
 * collection, and service return value conforms to one of these shapes so the data
 * layer can be swapped for real `/api` responses without touching the UI.
 *
 * @file Types are structural documentation + IDE contracts. No runtime enforcement.
 */

/**
 * @typedef {'developer' | 'recruiter' | 'superuser'} Role
 * A superuser acts as both workspaces; see lib/roles.js.
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {Role} role
 * @property {string} name
 * @property {string} email
 * @property {string} headline - One-line professional title, e.g. "Backend engineer · Go, Postgres".
 * @property {string} location - City, State/Country.
 * @property {string} avatar - URL or null; null renders an initials avatar.
 * @property {string} bio - 1-3 sentence professional summary.
 * @property {string[]} skills
 * @property {string} [githubUsername]
 * @property {string} [website]
 * @property {string} [linkedIn]
 * @property {string} [twitter]
 * @property {string} [openTo] - Free-text intent, e.g. 'new-roles' | 'collaboration' | 'not-looking'.
 * @property {boolean} emailVerified
 * @property {ExperienceLevel} [experienceLevel]
 * @property {number} [yearsOfExperience]
 * @property {string} [resume] - Filename displayed in the profile; the download is simulated.
 * @property {CareerItem[]} [experience]
 * @property {CareerItem[]} [education]
 * @property {Visibility} [visibility]
 * @property {NotificationPrefs} [notificationPrefs]
 * @property {string} [companyId] - Recruiter only.
 * @property {string} [title] - Recruiter only, e.g. "Talent Lead".
 * @property {string} [companyName] - Recruiter only, denormalized for list rows.
 * @property {JobPreferences} [preferences] - Developer only; feeds the matcher.
 * @property {string} [demoPassword] - Sign-up accounts only. Demo credential, never a hash.
 */

/**
 * @typedef {Object} JobPreferences
 * @property {'remote' | 'hybrid' | 'onsite' | 'any'} workMode
 * @property {ExperienceLevel} [experienceLevel]
 * @property {JobType[]} roleTypes
 * @property {string[]} locations
 * @property {number|null} [minSalary]
 */

/** @typedef {'junior' | 'mid' | 'senior' | 'lead' | 'principal'} ExperienceLevel */

/** @typedef {'public' | 'connections' | 'private'} Visibility */

/**
 * @typedef {Object} NotificationPrefs
 * @property {boolean} connectionRequests
 * @property {boolean} applicationUpdates
 * @property {boolean} jobMatches
 * @property {boolean} recruiterActivity
 */

/**
 * @typedef {Object} CareerItem
 * @property {string} title
 * @property {string} organization
 * @property {string} startYear
 * @property {string} [endYear] - Omitted when current.
 * @property {string} [detail]
 */

/**
 * @typedef {Object} Company
 * @property {string} id
 * @property {string} name
 * @property {string} industry
 * @property {string} size - e.g. '51-200'.
 * @property {string} location
 * @property {string} [website]
 * @property {string} blurb - Two-sentence description used on job detail pages.
 * @property {string} [logoText] - Short mark rendered as a monogram tile.
 */

/** @typedef {'remote' | 'hybrid' | 'onsite'} WorkMode */
/** @typedef {'full-time' | 'part-time' | 'contract' | 'internship'} JobType */
/** @typedef {'draft' | 'published' | 'closed'} JobStatus */

/**
 * @typedef {Object} Job
 * @property {string} id
 * @property {string} title
 * @property {string} companyId
 * @property {string} recruiterId - Must reference an existing user able to act as recruiter.
 * @property {string} location
 * @property {WorkMode} workMode
 * @property {JobType} jobType
 * @property {ExperienceLevel} experienceLevel
 * @property {{ min: number, max: number, currency: string, period: 'year' | 'month' }|null} salary
 * @property {string[]} requiredSkills - Drives the match score.
 * @property {string[]} preferredSkills
 * @property {string} description
 * @property {string[]} responsibilities
 * @property {JobStatus} status
 * @property {string} postedAt - ISO date.
 * @property {boolean} [isFeatured]
 * @property {string} [applyDeadline] - ISO date.
 */

/** @typedef {'applied' | 'under-review' | 'interview' | 'offer' | 'rejected' | 'withdrawn'} ApplicationStatus */

/**
 * @typedef {Object} Application
 * @property {string} id
 * @property {string} jobId
 * @property {string} userId - Applicant.
 * @property {ApplicationStatus} status
 * @property {string} appliedAt - ISO date.
 * @property {string} updatedAt - ISO date, last status change.
 * @property {string} coverNote
 * @property {ApplicationEvent[]} timeline
 * @property {{ note: string, scheduledFor: string }|null} [interview]
 */

/**
 * @typedef {Object} ApplicationEvent
 * @property {ApplicationStatus} status
 * @property {string} at - ISO date.
 * @property {string} by - 'developer' | 'recruiter' | 'system'.
 * @property {string} [note]
 */

/** @typedef {'pending' | 'accepted' | 'rejected' | 'none'} ConnectionState */

/**
 * @typedef {Object} Connection
 * @property {string} id
 * @property {string} fromUserId
 * @property {string} toUserId
 * @property {ConnectionState} state
 * @property {string} requestedAt
 * @property {string} [respondedAt]
 * @property {string} [message]
 */

/** @typedef {'connection-request' | 'connection-accepted' | 'application-update' | 'recruiter-activity' | 'system'} NotificationKind */

/**
 * @typedef {Object} AppNotification
 * @property {string} id
 * @property {string} userId - Recipient.
 * @property {NotificationKind} kind
 * @property {string} title
 * @property {string} body
 * @property {string} [href] - In-app route the notification opens.
 * @property {boolean} read
 * @property {string} createdAt
 * @property {string} [relatedId] - Entity id for grouping/de-dupe.
 */

/**
 * @typedef {Object} Repository
 * @property {string} id
 * @property {string} userId - Owner.
 * @property {string} name
 * @property {string} description
 * @property {string} language
 * @property {string[]} topics
 * @property {number} stars
 * @property {number} forks
 * @property {number} watchers
 * @property {string} pushedAt
 * @property {string} url - External link; opens GitHub in a new tab.
 * @property {boolean} isPinned
 * @property {number[]} contributions - 366 daily commit counts, index 0 = earliest day.
 * @property {number} [openIssues]
 * @property {string} [license]
 * @property {string} [defaultBranch]
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} userId
 * @property {string} title
 * @property {string} summary
 * @property {string[]} tags
 * @property {string} [url]
 * @property {string} [repoUrl]
 * @property {string} [period]
 * @property {boolean} [featured]
 */

/**
 * @typedef {Object} ActivityEvent
 * @property {string} id
 * @property {string} actorId
 * @property {'viewed-profile' | 'sent-request' | 'accepted-request' | 'applied' | 'posted-job' | 'starred-repo'} kind
 * @property {string} targetId
 * @property {string} at
 */

/**
 * @typedef {Object} MatchResult
 * @property {number} score - 0-100, deterministic for a given (developer, job) pair.
 * @property {string[]} matchedSkills
 * @property {string[]} missingSkills
 * @property {string[]} partialSkills - Preferred skills the developer has.
 * @property {string[]} reasons - Human sentences explaining the score.
 * @property {string[]} recommendations - Concrete actions to raise alignment.
 * @property {MatchBand} band
 *
 * @typedef {'strong' | 'good' | 'fair'} MatchBand
 */

/**
 * @typedef {Object} StoreSnapshot
 * Single persisted document holding every mutable collection. Kept as one blob so
 * cross-entity relations can never diverge between writes.
 * @property {number} schemaVersion
 * @property {User[]} users
 * @property {Company[]} companies
 * @property {Job[]} jobs
 * @property {Application[]} applications
 * @property {Connection[]} connections
 * @property {AppNotification[]} notifications
 * @property {Repository[]} repositories
 * @property {Project[]} projects
 * @property {ActivityEvent[]} activity
 * @property {Object<string, string[]>} savedJobs - keyed by userId
 * @property {Object<string, string[]>} savedCandidates - keyed by recruiter userId
 */
