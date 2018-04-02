# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150106103330) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "groups", force: :cascade do |t|
    t.string "email"
    t.string "name"
    t.text "message"
    t.boolean "has_submitted", default: false
    t.string "code"
    t.boolean "received_invite", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "guests", force: :cascade do |t|
    t.string "name"
    t.boolean "is_coming"
    t.bigint "group_id"
    t.boolean "is_baby"
    t.boolean "is_not_going_to_accept"
    t.boolean "is_not_going_to_accept_probably"
    t.index ["group_id"], name: "index_guests_on_group_id"
  end

  create_table "requests", force: :cascade do |t|
    t.string "song_title"
    t.string "artist"
  end

  create_table "users", force: :cascade do |t|
    t.string "username"
    t.string "email"
    t.string "crypted_password"
    t.string "password_salt"
    t.string "persistence_token"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

end
