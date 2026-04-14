#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
RUN_ID="${RUN_ID:-$(date +%s)}"
USERNAME="${USERNAME:-sentiment_test_${RUN_ID}}"
EMAIL="${EMAIL:-${USERNAME}@example.com}"
PASSWORD="${PASSWORD:-TestPassword123!}"

create_user() {
  echo "Creating user: ${USERNAME}"
  curl --silent --show-error --fail-with-body \
    -X POST "${BASE_URL}/api/users/register" \
    -H "Content-Type: application/json" \
    --data "{\"username\":\"${USERNAME}\",\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}"
  echo
  echo
}

create_post() {
  local title="$1"
  local content="$2"

  echo "Creating post: ${title}"
  curl --silent --show-error --fail-with-body \
    -X POST "${BASE_URL}/api/posts" \
    -H "Content-Type: application/json" \
    --data "{\"title\":\"${title}\",\"content\":\"${content}\",\"creator\":\"${USERNAME}\"}"
  echo
  echo
}

POST_1_TITLE="Quarterly Progress With Realistic Concerns"
POST_1_CONTENT="This quarter felt uneven, and I want to be honest about that. Several deadlines slipped, onboarding took longer than expected, and a few early prototypes were not strong enough to keep. Even so, the team learned where our assumptions were weak, and those lessons are already shaping better decisions. We now understand the customer pain points with more clarity, our communication is calmer, and the newest weekly check ins have reduced confusion. I am not pretending everything is fixed, because there is still a lot of hard work ahead. Still, the project no longer feels stuck. We have a clearer map, a steadier rhythm, and enough small wins to believe that disciplined effort can turn this shaky stretch into dependable progress."

POST_2_TITLE="Small Wins Are Starting To Add Up"
POST_2_CONTENT="The mood around the project is noticeably lighter this week. We still have open issues, but the difference is that the problems now feel measurable instead of mysterious. A tricky bug that blocked signups has been narrowed down, design feedback is arriving faster, and the latest planning session produced a roadmap that people actually trust. None of that makes the work effortless, yet it creates momentum. When one teammate solves a frustrating piece, everyone else can move with more confidence. I keep seeing moments where patience is rewarded: better test coverage, cleaner handoffs, and fewer surprises at the end of the day. The finish line is not close, but it finally feels visible, and that makes the next round of effort feel worthwhile."

POST_3_TITLE="Confidence Is Replacing Friction"
POST_3_CONTENT="What encourages me most right now is not one dramatic breakthrough, but the way consistent progress is changing our daily energy. Conversations that used to revolve around blockers now include ideas, experiments, and concrete next steps. People are volunteering to help one another without being asked, and that kind of trust is hard to fake. Our newest build is more stable, feedback from early users is kinder, and the team is starting to notice patterns that once looked chaotic. There is still uncertainty, yet it feels like healthy uncertainty, the kind that invites curiosity instead of dread. If we keep this pace, I think we will do more than recover. We will build something solid, useful, and genuinely satisfying to share."

POST_4_TITLE="The Future Looks Bright And Practical"
POST_4_CONTENT="I am leaving this week with real excitement because the project finally feels bigger than a checklist of tasks. The work is connecting. Features support each other, the product story is easier to explain, and the team is building with a sense of purpose instead of pure obligation. We are seeing proof that careful iteration pays off: performance is smoother, the interface is easier to navigate, and people testing the product are describing it with curiosity instead of hesitation. That shift matters. It means our effort is reaching others in a meaningful way. There will still be revisions, but they now feel like refinement, not rescue. If we stay focused, the next few milestones could turn a promising idea into something reliable, valuable, and surprisingly inspiring."

POST_5_TITLE="We Are Building Toward Something Remarkable"
POST_5_CONTENT="Today feels like one of those rare moments when effort, clarity, and hope all line up at once. The project is no longer merely surviving. It is showing the shape of what it can become, and that future looks genuinely exciting. Every recent improvement has created room for another one, as if momentum is feeding itself. People are communicating with generosity, solving problems with imagination, and treating setbacks as useful information instead of evidence of failure. That mindset changes everything. It turns pressure into focus and uncertainty into possibility. I can picture this work helping real people, opening new opportunities for the team, and setting a standard we will be proud to remember. If we continue with this level of care and optimism, the outcome could be exceptional."

create_user

create_post "${POST_1_TITLE}" "${POST_1_CONTENT}"
create_post "${POST_2_TITLE}" "${POST_2_CONTENT}"
create_post "${POST_3_TITLE}" "${POST_3_CONTENT}"
create_post "${POST_4_TITLE}" "${POST_4_CONTENT}"
create_post "${POST_5_TITLE}" "${POST_5_CONTENT}"

echo "Finished."
echo "Username: ${USERNAME}"
echo "Email: ${EMAIL}"
echo "Base URL: ${BASE_URL}"
