<h2 id="projects" style="margin: 2px 0px -15px;">Selected Project</h2>

<div class="projects">
<ol class="bibliography1">

{% for link in site.data.projects.main %}

<li>
<div class="proj-row">
  <div class="col-sm-30 abbr" style="position: relative;padding-right: 15px;padding-left: 15px;">
    {% if link.image %} 
    <img src="{{ link.image }}" class="teaser img-fluid z-depth-1" style="width=100;height=40%">
    {% if link.conference_short %} 
    <abbr class="badge">{{ link.conference_short }}</abbr>
    {% endif %}
    {% endif %}
  </div>
  <div class="col-sm-90" style="position: relative;padding-right: 15px;padding-left: 20px;">
      <div class="title1"><a href="{{ link.pagelink }}" target="_blank" rel="noopener noreferrer">{{ link.title }}</a></div>
      <div class="author1">{{ link.authors }}</div>
      {% if link.conference %} 
      <div class="periodical1"><em>{{ link.conference }}</em>
      </div>
      {% endif %}
    <div class="links1">
      {% if link.pdf %} 
      <a href="{{ link.pdf }}" class="btn btn-sm z-depth-0" role="button" target="_blank" rel="noopener noreferrer" style="font-size:12px;">PDF</a>
      {% endif %}
      {% if link.code %} 
      <a href="{{ link.code }}" class="btn btn-sm z-depth-0" role="button" target="_blank" rel="noopener noreferrer" style="font-size:12px;">Code</a>
      {% endif %}
      {% if link.page %} 
      <a href="{{ link.page }}" class="btn btn-sm z-depth-0" role="button" target="_blank" rel="noopener noreferrer" style="font-size:12px;">Project Page</a>
      {% endif %}
      {% if link.bibtex %} 
      <a href="{{ link.bibtex }}" class="btn btn-sm z-depth-0" role="button" target="_blank" rel="noopener noreferrer" style="font-size:12px;">BibTex</a>
      {% endif %}
      {% if link.notes %} 
      <strong> <i style="color:#e74d3c">{{ link.notes }}</i></strong>
      {% endif %}
      {% if link.others %} 
      {{ link.others }}
      {% endif %}
    </div>
  </div>
</div>
</li>
<br>

{% endfor %}

</ol>
</div>
