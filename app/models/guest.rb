class Guest  < ActiveRecord::Base
   belongs_to :group 
   validates :name, presence: true

   def self.num_coming
      where(is_coming: true).count
   end

end
