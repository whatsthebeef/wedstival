class CreateGuest < ActiveRecord::Migration[5.1]
   def change
      create_table :guests do |t|
         t.string :name
         t.boolean :is_coming
         t.belongs_to :group
      end
   end
end
