let briefs = (ls briefs/*.md | get name)
$briefs | each { |f| 
  let lines = (open $f | lines)
  let td_id = ($lines | where { |l| $l | str starts-with 'TD-ID:' } | get 0? | split row ' ' | get 1? | default '—')
  let title = ($lines | where { |l| $l | str starts-with '# Brief:' } | get 0? | str replace '# Brief:' '' | str trim | default ($f | path basename | str replace '.md' ''))
  {td_id: $td_id, title: $title}
} | table
