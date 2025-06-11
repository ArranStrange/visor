#!/bin/bash

gh issue create --title "featured presets and film simulations on homepage" --body $'
**Description**
Highlight select presets and film simulations on the homepage. These can be editorial picks, trending uploads, or community favourites. The goal is to surface high-quality content and encourage deeper exploration.

**Goals**
- Curate content visually for new and returning users
- Encourage discovery and inspiration
- Build trust in quality and creativity of the platform

**Tasks**
- Design and implement a homepage section for featured content
- Add support for "featured" flag in backend schemas
- Create admin route to mark content as featured
- Add frontend carousel/grid section for featured items
'

gh issue create --title "follow users and receive updates" --body $'
**Description**
Allow users to follow other contributors and receive notifications when they upload new presets, film sims, or post comments. This encourages ongoing engagement and community-building.

**Goals**
- Help users stay connected with creators they like
- Encourage ongoing contribution and recognition

**Tasks**
- Add follow/unfollow functionality to user profiles
- Update backend to track follower/following relationships
- Integrate new upload/follow activity into notifications
- Show follower/following counts on profile
- Display "followed users" updates on homepage or feed
'

gh issue create --title "reactions on comments" --body $'
**Description**
Add emoji-style reactions (e.g. 👍 🔥 💡) to comments to allow lightweight community engagement without always needing a written reply.

**Goals**
- Make community feedback more expressive and fun
- Lower barrier to interaction

**Tasks**
- Add reactions array to comment schema
- Allow users to add/remove reactions
- Display top reactions visibly on each comment
- Optional: Add reaction filters or sort options
'

gh issue create --title "preset download history and analytics" --body $'
**Description**
Track and display the number of times each preset or film sim has been downloaded, optionally showing trends over time or user demographics.

**Goals**
- Help creators understand which of their work is resonating
- Highlight popular tools for new users

**Tasks**
- Track download counts per preset/sim
- Optionally log who downloaded what
- Show total and recent download stats on detail pages
- Add analytics dashboard for users to view download activity
'

gh issue create --title "recommended presets based on film simulation" --body $'
**Description**
On each film simulation page, show presets that are either compatible with or inspired by that sim. This encourages cross-pollination between native camera looks and Lightroom workflows.

**Goals**
- Connect native Fuji simulations with digital editing workflows
- Encourage experimentation and learning

**Tasks**
- Add relational field to connect presets and sims
- Update preset submission form to allow linking a film sim
- Show related presets in a section on film sim detail pages
- Show related film sims on relevant preset pages
'

gh issue create --title "support for multiple image uploads per preset" --body $'
**Description**
Allow users to upload a full gallery of example images for each preset (not just a single before/after). These can demonstrate versatility across scenes, lighting, or subjects.

**Goals**
- Showcase real-world use cases for each preset
- Give viewers more context for visual impact

**Tasks**
- Update upload form to support multiple images
- Display image gallery on preset detail pages
- Allow optional captions or scene tags for each image
- Handle responsive layout for gallery view
'