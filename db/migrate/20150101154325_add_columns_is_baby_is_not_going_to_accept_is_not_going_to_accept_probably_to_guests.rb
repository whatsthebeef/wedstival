class AddColumnsIsBabyIsNotGoingToAcceptIsNotGoingToAcceptProbablyToGuests < ActiveRecord::Migration
   def change
      add_column :guests, :is_baby, :boolean, defualt: false
      add_column :guests, :is_not_going_to_accept, :boolean, defualt: false
      add_column :guests, :is_not_going_to_accept_probably, :boolean, defualt: false
   end
end
