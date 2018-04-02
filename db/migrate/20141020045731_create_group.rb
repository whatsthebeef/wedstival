class CreateGroup < ActiveRecord::Migration[5.1]
   def change
      create_table :groups do |t|
         t.string :email
         t.string :name
         t.string :message
         t.boolean :has_submitted, default: false  
         t.string :code
      end
   end
end
