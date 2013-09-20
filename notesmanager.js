/* notesmanager.js
 *  this file is part of Note Editor
 *
 * Copyright (C) 2013 Alessandro Campagni <alessandro.campagni@gmail.com>
 *
 * Note Editor is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Note Editor is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 */

const Gio = imports.gi.Gio;
const Json = imports.gi.Json;

const Lang = imports.lang;

const NotesManager = new Lang.Class({
    Name: 'NotesManager',

    _init: function(document_file) {
        this._page = -1;
        this._file = Gio.File.new_for_uri(document_file.get_uri()+".notes");
        
        if (!this._file.query_exists(null)) {
            this._file.create(Gio.FileCreateFlags.NONE, null);
            this._file.append_to_async (Gio.FileCreateFlags.NONE, null, null,
                                        Lang.bind (this, this._appendAsyncCb));
        }

        this._parser = new Json.Parser();
        this._parser.load_from_file(this._file.get_path());
        this._object = this._parser.get_root().get_object();
    },

    _appendAsyncCb: function(obj, res, data) {
        let output_stream = obj.append_to_finish(res, null);
        let byte_array = ByteArray.fromString("{\n  \"0\" : \"\"\n}");
        output_stream.write_bytes_async (byte_array.toGBytes(), 0, null,
                                         Lang.bind(this, function(obj, res, data) {
                                             obj.write_bytes_finish(res, null);
                                         }));
    },

    get_note_page: function(page) {
        return this._object.get_member(String(page)).get_string();
    }
});
