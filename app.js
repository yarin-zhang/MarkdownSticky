window.onload = function() {
    var zIndex = 0;
    var notes = JSON.parse(localStorage.getItem('notes')) || [];
    var nextNoteX = 0;

    function addNote(note) {
        var notesContainer = document.getElementById('notes-container');

        var noteElement = document.createElement('div');
        noteElement.className = 'note';
        noteElement.innerHTML = marked.parse(note.content);
        noteElement.style.position = 'absolute';
        noteElement.style.zIndex = zIndex++;
        noteElement.style.transform = 'translate(' + note.x + 'px, ' + note.y + 'px)';

        noteElement.setAttribute('data-x', note.x);
        noteElement.setAttribute('data-y', note.y);

        interact(noteElement).draggable({
            listeners: {
                start: function(event) {
                    event.target.setAttribute('data-x', note.x);
                    event.target.setAttribute('data-y', note.y);
                },
                move: function(event) {
                    var target = event.target;
                    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);

                    note.x = x;
                    note.y = y;
                    localStorage.setItem('notes', JSON.stringify(notes));
                }
            }
        }).resizable({
            edges: { left: true, right: true, bottom: true, top: true },
            margin: 10
        });

        var deleteButton = document.getElementById('delete-button-template').cloneNode(true);
        deleteButton.style.display = 'block';
        deleteButton.addEventListener('click', function() {
            notesContainer.removeChild(noteElement);
            notes = notes.filter(function(n) { return n !== note; });
            localStorage.setItem('notes', JSON.stringify(notes));
        });

        noteElement.appendChild(deleteButton);
        notesContainer.appendChild(noteElement);
    }

    document.getElementById('add-note').addEventListener('click', function() {
        var noteInput = document.getElementById('note-input');
        var noteContent = noteInput.value.trim();

        if (noteContent === '') {
            return;
        }

        // Check all possible positions for the new note
        var noteX = 0;
        while (notes.some(function(existingNote) {
            return Math.abs(existingNote.x - noteX) < 220;
        })) {
            noteX += 220;
        }

        var note = {
            content: noteContent,
            x: noteX,
            y: noteInput.getBoundingClientRect().bottom
        };

        notes.push(note);
        localStorage.setItem('notes', JSON.stringify(notes));

        addNote(note);

        noteInput.value = '';
    });

    document.getElementById('delete-all-notes').addEventListener('click', function() {
        localStorage.clear();
        location.reload();
    });


    document.getElementById('export-notes').addEventListener('click', function() {
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem('notes'));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", "notes.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    document.getElementById('import-notes').addEventListener('click', function() {
        var uploadInputNode = document.createElement('input');
        uploadInputNode.setAttribute("type", "file");
        uploadInputNode.addEventListener('change', function(e) {
            var reader = new FileReader();
            reader.onload = function(event) {
                notes = JSON.parse(event.target.result);
                localStorage.setItem('notes', JSON.stringify(notes));
                location.reload();
            };
            reader.readAsText(e.target.files[0]);
        });
        document.body.appendChild(uploadInputNode);
        uploadInputNode.click();
        uploadInputNode.remove();
    });

    notes.forEach(addNote);
}
