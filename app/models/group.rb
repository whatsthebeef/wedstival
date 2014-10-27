require 'zlib'
class Group < ActiveRecord::Base
   before_validation :generate_code

   has_many :guests

   validates :name, presence: true
   validates :code, presence: true
   validates :name, uniqueness: true
   validates :code, uniqueness: true
   validates :email, uniqueness: true

   def generate_code 
      if code.blank?
         self.code = Digest::SHA1.hexdigest "#{name}#{Rails.configuration.hash_string}"
      end
   end
end
