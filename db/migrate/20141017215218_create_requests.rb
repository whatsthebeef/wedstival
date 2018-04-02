class CreateRequests < ActiveRecord::Migration[5.1]
  def change
    create_table :requests do |t|
       t.string :song_title
       t.string :artist
    end
  end
end
