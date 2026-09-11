-- Clear all existing properties and projects data
-- This migration deletes all rows from properties and projects tables

DELETE FROM public.properties;
DELETE FROM public.projects;
