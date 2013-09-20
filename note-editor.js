/*
 * Copyright (c) 2013 Alessandro Campagni <alessandro.campagni@gmail.com>
 *
 * Note Editor is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by the
 * Free Software Foundation; either version 2 of the License, or (at your
 * option) any later version.
 *
 * Note Editor is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with Gnome Documents; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 */

const EvDoc = imports.gi.EvinceDocument;
const EvView = imports.gi.EvinceView;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const _ = imports.gettext.gettext;

const Lang = imports.lang;

const NotesManager = imports.notesmanager;

const NoteEditor = new Lang.Class({
    Name: 'NoteEditor',

    _init: function(doc_uri) {
	Gtk.init(null, 0);
	EvDoc.init();

	this._load_document_view(doc_uri);
	this._load_note_view();

	this._nm = new NotesManager.NotesManager(this._doc_file);
	let note = this._nm.get_note_page(this._curr_page);
	this._text_view.get_buffer().set_text(note, -1);

	Gtk.main();
    },

    _load_document_view: function(doc_uri) {
	this._doc_file = Gio.File.new_for_uri(doc_uri);
	let doc = EvDoc.Document.factory_get_document_for_gfile(
	    this._doc_file,
	    EvDoc.DocumentLoadFlags.NONE,
	    null);
	this._doc_n_pages = doc.get_n_pages();
	this._doc_model = EvView.DocumentModel.new_with_document(doc);
	this._curr_page = this._doc_model.get_page();
	this._doc_model.set_continuous(false);
	this._doc_view = new EvView.View();
	this._doc_view.set_model(this._doc_model);
	this._doc_view.set_size_request(600, -1);
    },

    _load_note_view: function() {
	this._window = new Gtk.Window({ type: Gtk.WindowType.TOPLEVEL,
					name: "note_editor",
					title: _("Note Editor") });
	this._window.connect("destroy",
			     function() {
				 Gtk.main_quit();
				 EvDoc.shutdown(); });

	this._next_bt = new Gtk.Button({ label: _("Next") });
	this._prev_bt = new Gtk.Button({ label: _("Previous") });
	this._next_bt.connect("clicked", Lang.bind(this, this._next_page));
	this._prev_bt.connect("clicked", Lang.bind(this, this._prev_page));
	if (this._curr_page == this._doc_n_pages)
	    this._next_bt.set_sensitive(false);
	if (this._curr_page == 0)
	    this._prev_bt.set_sensitive(false);

	this._bt_box = new Gtk.Box({
	    orientation: Gtk.Orientation.HORIZONTAL });
	this._bt_box.pack_start(this._prev_bt, false, false, 0);
	this._bt_box.pack_start(this._next_bt, false, false, 0);

	this._text_view = new Gtk.TextView();
	this._text_view.set_wrap_mode(Gtk.WrapMode.WORD);

	this._scrolled = new Gtk.ScrolledWindow({ hadjustment: null,
						  vadjustment: null });
	this._scrolled.add(this._text_view);
	this._scrolled.set_size_request(400, -1);

	this._box = new Gtk.Box({
	    orientation: Gtk.Orientation.HORIZONTAL,
	    spacing: 0 });

	this._edit_box = new Gtk.Box({
	    orientation: Gtk.Orientation.VERTICAL,
	    spacing: 0 });

	this._edit_box.pack_start(this._scrolled, true, true, 0);
	this._edit_box.pack_start(this._bt_box, false, true, 0);

	this._box.set_homogeneous(true);
	this._box.pack_start(this._doc_view, true, true, 0);
	this._box.pack_start(this._edit_box, true, true, 0);

	this._window.add(this._box);
	this._window.show_all();
    },

    _next_page: function() {
	this._update_note();
        this._doc_view.next_page();
	this._curr_page = this._curr_page + 1;
        let note = this._nm.get_note_page(this._curr_page);
        this._text_view.get_buffer().set_text(note, -1);
        if (this._curr_page == this._doc_n_pages - 1)
            this._next_bt.set_sensitive(false);
        if (this._curr_page == 1)
            this._prev_bt.set_sensitive(true);
    },

    _prev_page: function() {
	this._update_note();
        this._doc_view.previous_page();
	this._curr_page = this._curr_page - 1;
        let note = this._nm.get_note_page(this._curr_page);
        this._text_view.get_buffer().set_text(note, -1);
        if (this._curr_page == 0)
            this._prev_bt.set_sensitive(false);
        if (this._curr_page == this._doc_n_pages - 2)
            this._next_bt.set_sensitive(true);
    },

    _update_note: function() {
	let note = this._text_view.get_buffer().get_text(
	    this._text_view.get_buffer().get_start_iter(),
	    this._text_view.get_buffer().get_end_iter(),
	    true);
	this._nm.set_note_page(note, this._curr_page);
    }
});

new NoteEditor("file:///home/gnomedev/Sources/note-editor/presentation.pdf");
