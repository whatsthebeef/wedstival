class ChangeMessageColumnToTextInGroups < ActiveRecord::Migration[5.1]
   def change
      change_column :groups, :message, :text
   end
end
