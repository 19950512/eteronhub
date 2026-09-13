#!/usr/bin/env bash
set -euo pipefail

# Move o item do GitHub Project (v2) do usuário $PROJECT_OWNER, board $PROJECT_NUMBER,
# para a coluna (campo "Status") com o nome exato passado como argumento. Se a issue
# ainda não for um item do Project, ela é adicionada antes de mover.
#
# Isso é só um espelho visual: quem dispara os workflows são as labels na issue
# (ver .github/workflows/agent-planning.yml e agent-implement.yml). Um Project de
# usuário não suporta o evento projects_v2_item como trigger nativo do Actions,
# então o board não pode ser a origem do disparo — só o destino da atualização.
#
# Requer env vars:
#   GH_TOKEN       - PAT com escopo "project" (secrets.PROJECT_PAT)
#   PROJECT_OWNER  - login do usuário dono do Project (ex.: "19950512")
#   PROJECT_NUMBER - número do Project (ex.: "10")
#   ISSUE_NODE_ID  - node_id da issue (github.event.issue.node_id)
#
# Uso: set-project-status.sh "Nome exato da coluna"

STATUS_NAME="${1:?uso: set-project-status.sh <nome-da-coluna>}"

SCHEMA=$(gh api graphql -f query='
  query($login: String!, $number: Int!) {
    user(login: $login) {
      projectV2(number: $number) {
        id
        field(name: "Status") {
          ... on ProjectV2SingleSelectField {
            id
            options { id name }
          }
        }
      }
    }
  }' -f login="$PROJECT_OWNER" -F number="$PROJECT_NUMBER")

PROJECT_ID=$(echo "$SCHEMA" | jq -r '.data.user.projectV2.id')
FIELD_ID=$(echo "$SCHEMA" | jq -r '.data.user.projectV2.field.id')
OPTION_ID=$(echo "$SCHEMA" | jq -r --arg name "$STATUS_NAME" \
  '.data.user.projectV2.field.options[] | select(.name == $name) | .id')

if [ -z "$OPTION_ID" ] || [ "$OPTION_ID" == "null" ]; then
  echo "Erro: não encontrei a coluna \"$STATUS_NAME\" no campo Status do Project $PROJECT_OWNER/$PROJECT_NUMBER." >&2
  echo "Colunas existentes: $(echo "$SCHEMA" | jq -r '.data.user.projectV2.field.options[].name' | paste -sd, -)" >&2
  exit 1
fi

ITEM_ID=$(gh api graphql -f query='
  mutation($projectId: ID!, $contentId: ID!) {
    addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
      item { id }
    }
  }' -f projectId="$PROJECT_ID" -f contentId="$ISSUE_NODE_ID" \
  --jq '.data.addProjectV2ItemById.item.id')

gh api graphql -f query='
  mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
    updateProjectV2ItemFieldValue(input: {
      projectId: $projectId,
      itemId: $itemId,
      fieldId: $fieldId,
      value: { singleSelectOptionId: $optionId }
    }) {
      projectV2Item { id }
    }
  }' -f projectId="$PROJECT_ID" -f itemId="$ITEM_ID" -f fieldId="$FIELD_ID" -f optionId="$OPTION_ID" \
  > /dev/null

echo "Item movido para \"$STATUS_NAME\" no Project."
