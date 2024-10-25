# the default rule in this makefile will build the pdf 
# 'make force' will rebuild the pdf (e.g., after a citation change)
# 'make bib' will rebuild the citations
# 'make clean' will remove derived latex files.
# I often run 'make | grep Warning' 


main.pdf: abstract.tex introduction.tex main.tex requirements-functional.tex testing.tex architecture.tex iterations.tex AI-Usage.tex reflection.tex requirements-nonfunctional.tex tutorial.tex
	pdflatex main.tex

.phony: force
force::
	pdflatex main.tex

.phony: bib
bib: references.bib
	bibtex main

.phony: clean
clean:
	@-/bin/rm main.aux main.log main.out main.pdf main.bbl main.blg main.toc

