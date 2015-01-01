class Guest  < ActiveRecord::Base
   belongs_to :group 
   validates :name, presence: true

   def self.num_babies
      where(is_baby: true).count
   end

   def self.num_coming
      where(is_coming: true, is_baby: false).count
   end

   def self.num_babies_coming
      where(is_baby: true, is_coming: true).count
   end

   def self.num_coming
      where(is_baby: false, is_coming: true).count
   end

   def self.num_max
      where(is_baby: false, is_not_going_to_accept: false).count
   end

   def self.num_min
      where(is_baby: false, is_not_going_to_accept_probably: false, 
               is_not_going_to_accept: false).count
   end

end
