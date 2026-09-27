# BANDUP content schema (v1) — all agents MUST follow exactly. Files are UTF-8 JSON arrays unless noted.
# Every file is an object: {"license": "...", "items": [...]}. Korean fields end with _ko. ids are stable strings.

vocab.json items:
{ id:"nawl:0412"|"ngsl:1350", w:"allocate", pos:"v", ko:"할당하다, 배분하다", ex:"The council allocated funds to the new library.", ex_ko:"…", col:["allocate resources","allocate funds to"], src:"NAWL"|"NGSL", deck:"core"|"listening"|"reading", topic:""|"biology"|"psychology"|"history"|"tech-agri"|"env-health"|"science"|"lang-edu"|"biz-econ"|"tourism-transport"|"art-arch"|"electrical"|"energy", audio:"audio/v/nawl-0412.m4a", tReveal:3.2 }
  license: "NGSL/NAWL © Browne, Culligan & Phillips, CC BY-SA 4.0. Korean meanings and examples are derivative works of this app, shared under CC BY-SA 4.0."

irregular.json items: { base:"fly", past:"flew", pp:"flown", ko:"날다", ex:"She flew to Canada to extend her visa." }

grammar.json items: { id:"g-article-001", type:"article"|"be"|"tense"|"prep"|"toinf", kind:"mcq"|"fix"|"cloze"|"ko2en", prompt:"…", prompt_ko:"…"|"" , options:["a","the","—"]|[], answer:"…" (string; for fix = corrected sentence), why_ko:"…" }

reading.json items: { id:"r-01", len:"short"|"long", topic:"biology"…, title:"…", paras:[ {label:"A", text:"…"} , … ], words:452,
  questions:[ {n:1, type:"tfng", stmt:"…", answer:"TRUE"|"FALSE"|"NOT GIVEN", evidence:{para:"B", quote:"exact sentence from passage"}, why_ko:"…"},
              {n:8, type:"heading", para:"C", options_ref:"H", answer:"iv", why_ko:"…"} ],
  headings:[ "i  …", "ii …" ] (only for long), minutes:20 }

listening.json items: { id:"l-p1-01", part:1|2|3|4, title:"…", voices:[{name:"Daniel", role:"agent"}, …], script:[ {spk:"agent", text:"…"} … ],
  audio:"audio/l/l-p1-01.m4a", duration:185,
  questions:[ {n:1, type:"form"|"mcq"|"note", prompt:"Name: ____", limit:"ONE WORD AND/OR A NUMBER", answer:["Harrington"], accept:["harrington"], trap_ko:"정정 함정 설명"|"" , predict:"name"|"number"|"date"|"money"|"place"|"noun"|"plural-noun"|"verb" } ] }
dictation.json items: { id:"d-001", text:"The course starts on the fifteenth of September.", focus:"date"|"number"|"spelling"|"money"|"linking", audio:"audio/d/d-001.m4a" }
voa.json items: { id:"voa-01", title, url:"https://learningenglish.voanews.com/…", credit:"VOA Learning English (public domain)", audio:"audio/voa/voa-01.m4a", start:0, end:75, transcript:"…", blanks:[{word:"…", idx:12}] }

shadow.json items: { id:"sh-01", src:"self"|"voa"|"public-domain", credit:"…", title:"…", level:1-3, lines:[ {en:"I work as a planner at a pharmacy.", ko:"…", stress:"I WORK as a PLANner at a PHARmacy", chunks:"I work as a planner / at a pharmacy", focus:"article"|"be"|… } ], audio:"audio/sh/sh-01.m4a"|"" }

speaking.json: {"license":"…","p1":[{id:"p1-01", topic:"work", q:"…", upgrades:[{plain:"…",better:"…"}], sample:"answer→reason→example (3 sentences)"}],
  "p2":[{id:"p2-01", card:"Describe a place you often go to", bullets:["where it is","how often you go","what you do there"], explain:"and explain why you like it", story:"place", sample:"…(band 7, ~220 words)"}],
  "p3":[{id:"p3-01", p2:"p2-01", q:"…", sample:"…"}]}

writing.json: {"license":"…","t1":[{id:"t1-01", kind:"line"|"bar"|"table"|"pie"|"process"|"map", prompt:"…", data:{…chart JSON: {title, units, xLabels, series:[{name, values}]} or table rows or process steps or map before/after features…}, model:"band 7 answer ~170 words", overview_hint_ko:"…"}],
  "t2":[{id:"t2-01", type:"opinion"|"discussion"|"adv-disadv"|"problem-solution"|"two-part", prompt:"…", plan_ko:"…", model:"band 7 ~270 words"}],
  "franklin":[{id:"fr-01", task:"t2"|"t1", text:"band 7 paragraph 120–170 words", notes:["keyword cue",…]}]}

pairs.json items: { id:"mp-fp-01", pair:"f/p", a:"fan", b:"pan", ex_a:"…", ex_b:"…" }

links.json items: { id, title, url, kind:"official"|"hackers-video", note_ko, ts:[{label:"Day 1", t:"0:00:00"}] }

Audio: generate with macOS `say` then `ffmpeg -c:a aac -b:a 32k -ac 1` (m4a). Voices available: check `say -v '?'`. Total audio ≤ 25 MB. Verify WER ≤10% with whisper-cli -m ~/bin/whisper-models/ggml-base.en.bin.
No copying of IELTS.org/Cambridge/Hackers text. All passages/scripts/questions self-written.
