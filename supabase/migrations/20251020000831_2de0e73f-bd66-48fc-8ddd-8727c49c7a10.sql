-- Remove national_contract_type column from employees table
-- This field is being replaced by ccnl_contract_id which references the ccnl_contracts table
ALTER TABLE employees DROP COLUMN IF EXISTS national_contract_type;