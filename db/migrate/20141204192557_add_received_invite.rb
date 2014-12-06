class AddReceivedInvite < ActiveRecord::Migration
   def change
      add_column :groups, :received_invite, :boolean, default: false
   end
end
