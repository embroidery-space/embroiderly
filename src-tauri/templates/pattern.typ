#set document(
  title: [{{ info.title }}],
  author: "{{ info.author }}",
  description: [{{ info.description }}]
)

#set page(
  paper: "a4",
  header: context [
    #set text(10pt)
    Page #counter(page).display("1") #h(1em)
    _{{ info.title }}_ #h(1fr) _{{ info.author }}_
  ]
)
#set text(font: "Noto Serif", size: 14pt)

#table(
  stroke: none,
  columns: 2,
  [*Pattern name:*], [{{ info.title }}],
  [*Designed by:*], [
    {{ info.author }}
    {%- if !info.copyright.is_empty() %}
      © {{ info.copyright }}
    {% endif %}
  ],
  [*Fabric:*], [{{ fabric.kind }} {{ fabric.name }}, {{ fabric.width }}W x {{ fabric.height }}H Stitches],
  table.cell(colspan: 2, [*Description:*]),
  table.cell(colspan: 2, [{{ info.description }}])
)

#table(
  stroke: none,
  columns: 4,
  table.header[*Symbol*][*Brand*][*Number*][*Color Name*],
  table.hline(),
  {% for palitem in palette %}
    [
      {% if let Some(symbol_font) = palitem.symbol_font %}
        #set text(font: "{{ symbol_font }}")
      {% endif %}
      {{ palitem.get_symbol() }}
    ],
    [{{ palitem.brand }}],
    [{{ palitem.number }}],
    [{{ palitem.name }}],
  {% endfor %}
)
