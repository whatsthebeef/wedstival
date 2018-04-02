class AdminController < ApplicationController
   before_action :authenticate

   def main_page
      @groups = Group.last_five
   end

end
