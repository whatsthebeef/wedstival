class ChangeMessageColumnToTextInGroups < ActiveRecord::Migration
   def change
      change_column :groups, :message, :text
   end
end
