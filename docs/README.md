# Documentation guide

Current entry points, updated 29 October 2026:

- [Project README](../README.md): available features and limits.
- [Installation](INSTALLATION.md): separate source-checkout and Windows-candidate instructions.
- [Release review](RELEASE-REVIEW.md): package contents, manual workflow, owner approval and outstanding physical acceptance tests. No GitHub release has been created.
- [Validation](VALIDATIE.md): latest 109-test Windows result and the limits of package, browser and hardware evidence.
- [Plan](PLAN.md), [architecture](ARCHITECTUUR.md), [contracts](CONTRACTEN.md) and [decisions](BESLUITEN.md): current boundaries followed by dated implementation history.
- [Artwork](ARTWORK.md): archive distribution and earlier extraction history.

Earlier feature guides and research reports preserve observations and the private development setup on their recorded dates. In those passages, “private adapter” does not mean required runtime source is still missing from GitHub. The reviewed runtime is now in `integration/runtime/`; settings, captures, individual identities, saves and the original SDK remain private. Use the installation and review guides for current startup, prerequisites and shutdown behavior.

The engine's only rules mode remains sandbox. The linked runtime is an optional adapter, with the official app as rule authority. Published source and a successful local candidate build do not establish complete campaign support or a verified first-time installation on another physical machine.
