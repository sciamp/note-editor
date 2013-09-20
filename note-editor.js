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

const NotesManager = imports.notesmanager;

Gtk.init(null, 0);
EvDoc.init();

var doc_file = Gio.File.new_for_path("presentation.pdf");
var doc = EvDoc.Document.factory_get_document_for_gfile(doc_file, EvDoc.DocumentLoadFlags.NONE, null);
var n_pages = doc.get_n_pages() - 1;
var doc_model = EvView.DocumentModel.new_with_document(doc);
doc_model.set_continuous(false);
var curr_page = doc_model.get_page();
var doc_view = new EvView.View();
doc_view.set_model(doc_model);
doc_view.set_size_request(600, -1);

var ne_window = new Gtk.Window({ type: Gtk.WindowType.TOPLEVEL,
                                 name: "note_editor",
                                 title: _("Note Editor") });
ne_window.connect("destroy",
                  function() {
                      Gtk.main_quit();
                      EvDoc.shutdown(); });

var next_bt = new Gtk.Button({ label: _("Next") });
next_bt.connect("clicked",
                function() {
                    doc_view.next_page();
                    let page = doc_model.get_page();
                    note = nm.get_note_page(page);
                    buffer.set_text(note, -1);
                    text_view.set_buffer(buffer);
                    if (page == n_pages)
                        next_bt.set_sensitive(false);
                    if (page == 1)
                        prev_bt.set_sensitive(true);
                    print(text_view.get_buffer().get_text(
                        text_view.get_buffer().get_start_iter(),
                        text_view.get_buffer().get_end_iter(),
                        true));
                });
if (curr_page == n_pages)
    next_bt.set_sensitive(false);

var prev_bt = new Gtk.Button({ label: _("Previous") });
prev_bt.connect("clicked",
                function() {
                    doc_view.previous_page();
                    let page = doc_model.get_page();
                    note = nm.get_note_page(page);
                    buffer.set_text(note, -1);
                    text_view.set_buffer(buffer);
                    if (page == 0)
                        prev_bt.set_sensitive(false);
                    if (page == n_pages - 1)
                        next_bt.set_sensitive(true);
                });
if (curr_page == 0)
    prev_bt.set_sensitive(false);

var bt_box = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
bt_box.pack_start(prev_bt, false, false, 0);
bt_box.pack_start(next_bt, false, false, 0);

var text_view = new Gtk.TextView();
text_view.set_wrap_mode(Gtk.WrapMode.WORD);
var scrolled = new Gtk.ScrolledWindow({ hadjustment: null,
                                        vadjustment: null });
scrolled.add(text_view);
scrolled.set_size_request(400, -1);

var box = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL,
                        spacing: 0 });
var edit_box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL,
                             spacing: 0 });

edit_box.pack_start(scrolled, true, true, 0);
edit_box.pack_start(bt_box, false, true, 0);

box.set_homogeneous(true);
box.pack_start(doc_view, true, true, 0);
box.pack_start(edit_box, true, true, 0);

ne_window.add(box);

ne_window.show_all();

var nm = new NotesManager.NotesManager(doc_file);
var note = nm.get_note_page(curr_page);
var buffer = new Gtk.TextBuffer();
buffer.set_text(note, -1);
text_view.set_buffer(buffer);

Gtk.main();
