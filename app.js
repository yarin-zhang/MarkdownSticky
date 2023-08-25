if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
    }).catch((error) => {
        console.log('Service Worker registration failed:', error);
    });
}

window.onload = function () {
    var zIndex = 0;
    var notes = JSON.parse(localStorage.getItem('notes')) || [];
    var nextNoteX = 0;

    function disableScroll() {
        document.body.style.overflow = 'hidden';
    }

    function enableScroll() {
        document.body.style.overflow = '';
    }

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
                start: function (event) {
                    event.preventDefault();
                    disableScroll();
                    event.target.setAttribute('data-x', note.x);
                    event.target.setAttribute('data-y', note.y);
                    event.target.style.zIndex = ++zIndex;
                },
                move: function (event) {
                    var target = event.target;
                    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);

                    note.x = x;
                    note.y = y;
                    localStorage.setItem('notes', JSON.stringify(notes));
                },
                end: function (event) {
                    enableScroll();
                },
            }
        }).resizable({
            edges: { left: true, right: true, bottom: true, top: true },
            listeners: {
                start: function (event) {
                    event.preventDefault();
                    disableScroll();
                    event.target.style.zIndex = ++zIndex;
                },
                move: function(event) {
                    let { x, y } = event.target.dataset;
        
                    x = (parseFloat(x) || 0) + event.deltaRect.left;
                    y = (parseFloat(y) || 0) + event.deltaRect.top;
        
                    Object.assign(event.target.style, {
                        width: `${event.rect.width}px`,
                        height: `${event.rect.height}px`,
                        transform: `translate(${x}px, ${y}px)`
                    });
                    Object.assign(event.target.dataset, { x, y });
                    note.x = x;
                    note.y = y;
                },
                end: function(event) {
                    enableScroll();
                    localStorage.setItem('notes', JSON.stringify(notes));
                }
            },
            margin: 10
        });

        var deleteButton = document.getElementById('delete-button-template').cloneNode(true);
        deleteButton.style.display = 'block';
        deleteButton.addEventListener('click', function () {
            notesContainer.removeChild(noteElement);
            notes = notes.filter(function (n) { return n !== note; });
            localStorage.setItem('notes', JSON.stringify(notes));
        });

        noteElement.appendChild(deleteButton);
        notesContainer.appendChild(noteElement);
    }

    document.getElementById('add-note').addEventListener('click', function () {
        var noteInput = document.getElementById('note-input');
        var noteContent = noteInput.value.trim();

        if (noteContent === '') {
            return;
        }

        // Check all possible positions for the new note
        var noteX = 0;
        var noteY = noteInput.getBoundingClientRect().bottom;
        while (notes.some(function (existingNote) {
            return Math.abs(existingNote.x - noteX) < 220 && Math.abs(existingNote.y - noteY) < 220;
        })) {
            noteX += 220;
            if (noteX + 220 > window.innerWidth) {
                noteX = 0;
                noteY += 220; // Adjust this value based on the height of your notes
            }
        }
        // If it's going beyond the window's height, reset to the top position
        if (noteY + 220 > window.innerHeight) {
            noteX = 0;
            noteY = 0;
        }

        var note = {
            content: noteContent,
            x: noteX,
            y: noteY
        };

        notes.push(note);
        localStorage.setItem('notes', JSON.stringify(notes));

        addNote(note);

        noteInput.value = '';
    });

    document.getElementById('delete-all-notes').addEventListener('click', function () {
        localStorage.clear();
        location.reload();
    });


    document.getElementById('export-notes').addEventListener('click', function () {
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem('notes'));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "notes.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    document.getElementById('import-notes').addEventListener('click', function () {
        var uploadInputNode = document.createElement('input');
        uploadInputNode.setAttribute("type", "file");
        uploadInputNode.addEventListener('change', function (e) {
            var reader = new FileReader();
            reader.onload = function (event) {
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
