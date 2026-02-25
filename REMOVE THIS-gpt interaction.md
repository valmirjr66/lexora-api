- 6.2: let's define as positional character intervals
- 7.1: it's will be locked by the state now (it will be IN_PROGRESS and the second call will fail with a 400 status code)

=========================================================================================================

Val, I’m going to treat this exactly as you asked: as a **Source of Truth for coding agents**. That means I’ll evaluate it not as a pitch doc, but as an executable specification. The question is: *Can an autonomous dev agent implement this without guessing?*

Right now: **almost, but not safely**.

Below is a structured analysis divided into:

1. Structural strengths
2. Critical ambiguities (must fix before coding agents use this)
3. Architectural inconsistencies
4. Domain modeling gaps
5. API contract issues
6. Agent orchestration risks
7. Operational & lifecycle blind spots
8. Recommendations for hardening it into a real SoT

---

# 1️⃣ Structural Strengths

You did several things very right:

* Clear domain separation: Script / Block / Occurrence / Output
* Immutability philosophy is well stated
* MVP constraints are explicitly declared
* Agent contracts are defined with JSON
* Orchestration flow is visualized
* Versioning is explicitly described
* Transcript as SoT is defined

For an MVP-level architecture doc, this is solid.

Now let’s tighten it.

---

# 2️⃣ Critical Ambiguities (Dangerous for Coding Agents)

These are areas where a coding agent **will have to guess**.

## ❗ 2.1 Script Immutability vs API Routes

You state:

> Scripts are immutable once used in an occurrence.

But your API allows:

```
PUT /scripts/:id
PUT /scripts/:script-id/blocks/:block-id
DELETE /scripts/:script-id/blocks/:block-id
```

This creates a contradiction:

* If a script has occurrences referencing version 1,
* And someone edits a block via PUT,
* Does:

  * The script version auto-increment?
  * A new script entity get created?
  * Or does the original script mutate?

You state version incrementing is required — but **you do not define how that is enforced at API level.**

This must be formalized.

Example needed:

> If script has at least one occurrence → modifications create new script version automatically. Old version becomes read-only.

Without this, agents will implement inconsistent behaviors.

---

## ❗ 2.2 Output Endpoint Inconsistency

Architecture diagram shows:

```
POST /occurrences/:id/outputs
```

But API routes define:

```
POST /scripts/:script-id/occurrences/:occurrence-id/outputs
```

These are not equivalent.

Which one is canonical?

You must pick one. Coding agents cannot infer hierarchy decisions.

Recommendation:
Occurrences should be globally unique.
Therefore:

```
POST /occurrences/:occurrence-id/outputs
```

is cleaner and avoids redundant script-id validation.

---

## ❗ 2.3 Output Artifact Contract Mismatch

You define:

### Output Artifact Entity:

```
Summary
Block Feedback (Script Block Id + Evaluation)
Final Verdict
```

But Evalo → Output contract returns:

```
overall_assessment
strengths
weaknesses
evaluation_per_tag
```

These two models are **not aligned**.

Where do:

* strengths
* weaknesses
* evaluation_per_tag

get stored?

Are they mapped into:

* Summary?
* Block Feedback?
* Final Verdict?

Right now the entity model and agent contract diverge.

This is a red flag for implementation.

---

## ❗ 2.4 EVAL Block — Assessment Scale Undefined

Lyra returns:

```
assessment: PASS | PARTIAL | FAIL
```

But Script Block only defines:

* Expected Response
* Common Mistakes

There is no:

* scoring model
* weighting
* threshold definition
* mapping to overall assessment

Then Evalo returns:

```
overall_assessment: STRONG | ADEQUATE | WEAK
```

What determines STRONG vs ADEQUATE?

Is it:

* percentage of PASS?
* weighted average?
* tag distribution?
* qualitative override?

Right now it’s undefined.

An AI coding agent cannot derive business logic from narrative intention.

---

# 3️⃣ Architectural Inconsistencies

## 3.1 Occurrence Lifecycle

You define only:

* CREATED
* COMPLETED

But output generation is a POST action.

What if:

* transcript exists
* output generation fails?
* evaluation crashes?

You say failure handling is out of scope.

That’s fine philosophically — but your state machine still needs clarity.

Right now:

Is COMPLETED:

* “transcript attached”
  or
* “output generated”?

You imply both.

But you need:

Clear state transition definition:

Example:

CREATED
→ TRANSCRIPT_ATTACHED
→ PROCESSING
→ COMPLETED

Even if you don’t implement failure states, define what COMPLETED strictly means.

---

## 3.2 Output Id in Occurrence

Occurrence contains:

```
Output Id (optional uuid)
```

But your routes allow multiple outputs:

```
GET /scripts/:script-id/occurrences/:occurrence-id/outputs
POST ...
```

That implies multiple outputs per occurrence.

Yet:

* MVP constraint says output generated once
* Occurrence stores single Output Id

This is contradictory.

You must choose:

Option A: One output per occurrence (simpler, recommended)
Option B: Many outputs allowed

Right now the spec says both.

---

# 4️⃣ Domain Modeling Gaps

## 4.1 No Block Ordering Definition

Scripts are linear sequences.

But Script entity has:

```
Blocks (collection of <Script Block>)
```

Collections are unordered.

You need:

```
Order (integer)
```

on Script Block.

Otherwise:

* Execution order is ambiguous
* Version comparison becomes undefined

---

## 4.2 Tag Semantics Not Formalized

You state:

> Blocks always have a tag

But tag is just string.

Is tag:

* free text?
* controlled vocabulary?
* unique per script?
* reusable across scripts?

Since Evalo aggregates by tag, tags must have consistency rules.

Otherwise aggregation becomes chaotic.

---

## 4.3 Script Owner Ambiguity

Script has:

```
Owner (uuid)
```

Owner refers to:

* User?
* Organization?
* Tenant?

No entity is defined for owner.

---

## 4.4 Authentication Model Underdefined

You define routes:

```
POST /users/authenticate
```

But:

* No JWT model defined
* No session behavior defined
* No password hashing policy defined (you explicitly say plain text)

Even for MVP, define:

* Is token returned?
* What format?
* Expiration?

Coding agents need minimal but explicit auth contract.

---

# 5️⃣ API Contract Issues

## 5.1 No Response Schemas

You define endpoints, but not response formats.

For SoT-level documentation, you must define:

* Request schema
* Response schema
* Status codes

Example missing:

```
POST /scripts
→ 201 Created
{
  "id": "uuid",
  ...
}
```

Without this, coding agents will invent their own conventions.

---

## 5.2 Missing Validation Rules

Examples:

* Expected Response required if Type is EVAL
  → Enforced where? API validation? DB constraint?

* Script Version auto-increment
  → When?

* Occurrence must reference existing script version
  → How validated?

These must be expressed as deterministic rules.

---

# 6️⃣ Agent Orchestration Risks

This is your most innovative part — and the most fragile.

## 6.1 Determinism Claim vs LLM Reality

You describe:

> deterministic multi-agent pipeline

But:

* Lyra is probabilistic.
* Evalo is probabilistic.

Deterministic pipeline ≠ deterministic output.

If determinism matters (for traceability), define:

* Temperature
* Model version locking
* Prompt versioning

Right now none of that is formalized.

---

## 6.2 Transcript Referencing

Lyra returns:

```
"transcript_references": ["quoted excerpt"]
```

Are these:

* exact string matches?
* character offsets?
* line numbers?

Without offset references, traceability is weak.

If this is for auditability, define reference format.

---

## 6.3 Evaluation Alignment with Script Version

You store script version in occurrence.

But:
Does Lyra receive:

* full script snapshot?
  or
* script id only?

Your Orchestrator → Lyra contract only sends:

```
{
  "occurrence_id": "uuid"
}
```

This implies Lyra must fetch script itself.

That means:

* Agents are coupled to DB.
* Not truly contract-isolated.

If you want clean orchestration:
Orchestrator should pass:

* Transcript
* Script version snapshot
* Blocks
* Expected responses

Otherwise hidden coupling exists.

---

# 7️⃣ Operational Blind Spots

## 7.1 No Concurrency Rules

What happens if:

* POST /outputs called twice?
* Two agents run simultaneously?

Need idempotency definition.

---

## 7.2 No Data Retention Policy

Transcript is raw text.

Is it:

* stored forever?
* deletable?
* anonymizable?

Since this is HR-related data, compliance matters even in MVP.

---

## 7.3 No Performance Assumptions

Is transcript size limited?
Max blocks per script?
Max evaluation time?

Agents need constraints.

---

# 8️⃣ Areas Where It’s Already Strong

To be clear: this is a very well thought-out conceptual MVP.

Strong points:

* Clear separation of template vs execution
* Version immutability philosophy
* Clean mental model
* Clear scoping decisions
* Explicit out-of-scope declarations

This is not amateur-level design.
It’s just not yet strict enough for machine consumption.

---

# 9️⃣ What You Must Add To Make This a True SoT

If this will feed coding agents, add:

### A. Formal State Machines

Define:

* Script state
* Occurrence state transitions
* Output generation state

---

### B. Explicit Versioning Mechanics

Example:

```
IF script.hasOccurrences == true
AND update requested
THEN clone script
INCREMENT version
APPLY modification
RETURN new script id
```

Make it algorithmic.

---

### C. Canonical Output Model

Align:

* Agent contract
* Database entity
* API response

They must be identical or explicitly mapped.

---

### D. Explicit Data Validation Rules

Example:

* EVAL block must contain Expected Response
* OPEN block must not contain Expected Response
* Order must be unique per script version

---

### E. Idempotency Definition

Define behavior of:

```
POST /occurrences/:id/outputs
```

If output already exists:

* 409?
* 200 returning existing?
* Regenerate?

---

### F. Explicit API Response Schemas

Every route:

* Request
* Response
* Status codes

Without this, agents invent behavior.

---

# Final Strategic Assessment

Right now your document is:

> A strong conceptual system description
> Not yet a machine-executable specification

It is about 75% of what a coding agent needs.

The missing 25% is:

* determinism
* state mechanics
* validation rules
* contract alignment

And here’s the important part:

If you don’t tighten these,
coding agents will fill gaps inconsistently,
and your system will drift.

You’re building something that depends on **structural precision**.
So your documentation must behave like code.

---

If you want, next step we can:

* Convert this into a **formal Technical Specification v1**
* Or rewrite it in a stricter “Executable Spec” format ready for coding agents.

Your foundation is good.
Now it needs discipline.
