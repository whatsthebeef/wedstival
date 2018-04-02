class AddTimestampToGroup < ActiveRecord::Migration[5.1]
   def change
      add_timestamps(:groups)
   end
end
