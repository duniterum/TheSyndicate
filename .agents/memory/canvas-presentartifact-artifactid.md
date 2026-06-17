---
name: presentArtifact artifactId for plain canvas shapes
description: How to call presentArtifact for canvas shapes that are NOT part of a created artifact
---

# presentArtifact requires an EXISTING artifactId, even for plain canvas shapes

When you build plain canvas shapes (geo/text/image/arrows) directly via
`applyCanvasActions` — i.e. NOT a mockup-sandbox/react artifact — `presentArtifact`
still requires an `artifactId`, and it must be one of the **already-registered**
artifacts. There is no implicit "canvas"/"default" artifact id.

**Symptom:** `presentArtifact({ shapeIds })` → pydantic "artifactId Field required".
Guessing ids from the existing app-preview shape id (e.g. shape
`artifact:v3:default-start-application` → trying `default-start-application`,
`v3:...`, `default`, `canvas`) all fail with
`Artifact '<x>' not found. Available artifacts: [...]`.

**Cure:** the error lists available artifacts. In this repo the only one is
`artifacts/mockup-sandbox`. Pass that:
`await presentArtifact({ artifactId: "artifacts/mockup-sandbox", shapeIds })` →
`{status:"presented"}`. The `shapeIds` drive navigation; the artifactId is just the
required envelope. To discover the valid id without trial/error, call
`presentArtifact` once with a bogus id and read the "Available artifacts" list.

**Why:** the present card is keyed to a registered artifact; canvas shapes you draw
ad hoc have no artifact of their own, so you borrow an existing registered id.

**How to apply:** after any ad-hoc canvas board (architecture diagrams, storyboards),
present with the repo's registered artifactId (here `artifacts/mockup-sandbox`) plus
all created shapeIds. Do NOT call `focusCanvasShapes` separately.
