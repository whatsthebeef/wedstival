class AdminController < ApplicationController
   before_filter :authenticate

   def main_page
      @groups = Group.last_five
   end

end
