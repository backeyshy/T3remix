# AUR packaging

These recipes package Remix Workbench stable and nightly AppImages from the fork’s GitHub releases. Generate the package recipe for a published release before building. The script updates both architecture checksums, builds for the host architecture, and runs `namcap`.

On Arch Linux, install `base-devel`, `github-cli`, `jq`, and `namcap`, then run the following with your fork’s release tag.

```bash
RELEASE_TAG=v1.2.3 packaging/aur/scripts/release.sh
```

Setting `T3REMIX_AUR_SSH_PRIVATE_KEY` enables publication to the corresponding Remix Workbench AUR repository. Leave it unset to build locally.
