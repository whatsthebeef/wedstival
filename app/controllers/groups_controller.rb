class GroupsController < ApplicationController
   before_filter :find_group, only: [:edit, :update, :show]  

   def index
      @groups = Group.all
   end

   def new
      @group = Group.new 
   end

   def create
      @group = Group.new(group_params)
      if @group.save
         redirect_to @group
      else 
         render "new"
      end
   end

   def edit
   end

   def update
      Group.update_attributes(group_params)
      if @group.save
         redirect_to @group
      else 
         render "new"
      end
   end

   def show 
   end

   private 
   def find_group
      @group = Group.find(params[:id])
   end

   def group_params
      params.require(:group).permit(:name, :code, :email)
   end
end
