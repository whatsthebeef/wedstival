class AddReceivedInvite < ActiveRecord::Migration[5.1]
   def change
      add_column :groups, :received_invite, :boolean, default: false
   end
end
