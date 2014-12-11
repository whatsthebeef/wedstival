class Admin::GroupsController < ApplicationController
   before_filter :find_group, only: [:edit, :update, :show, :send_invite, :destroy]  

   def index
      if params[:has_submitted].blank?
         @groups = Group.all
      else
         @groups = Group.where_has_submitted(params[:has_submitted])
      end
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
      @group.update_attributes(group_params)
      if @group.save
         redirect_to @group
      else 
         render "new"
      end
   end

   def show 
   end

   def destroy
      @group.delete
      redirect_to admin_groups_path
   end

   def rsvp
      @group = Group.find_by_code(params[:code])
   end

   def send_invite
      @group.send_invite
      redirect_to groups_path
   end

   private 
   def find_group
      @group = Group.find(params[:id])
   end

   def group_params
      params.require(:group).permit(:name, :code, :email, :has_submitted, :message, guests_attributes:[:is_coming, :id])
   end
end
