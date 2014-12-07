class StaticPagesController < ApplicationController
   layout "base_layout", only: :how_we_got_here 

   def whats_all_this
      @active_item = 0
   end

   def how_we_got_here
      @active_item = 1
   end

   def the_logistics
      @active_item = 2
   end

   def the_event
      @active_item = 3
   end

end
